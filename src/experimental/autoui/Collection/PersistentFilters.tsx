import { UnregisterCallback } from 'history';
import * as React from 'react';
import filter from 'lodash/filter';
import qs from 'qs';
import { JSONSchema } from '~/components/Renderer/types';
import { Filters, FilterSignature, FiltersProps, FiltersView } from '~/components/Filters';
import { createFilter, createFullTextSearchFilter, decodeFilter, flattenSchema, FULL_TEXT_SLUG } from '~/components/Filters/SchemaSieve';
import { getFromLocalStorage, setToLocalStorage } from '~/components/Table/TableUtils';

export interface ListQueryStringFilterObject {
	n: FilterSignature['field'];
	o: FilterSignature['operator'];
	v: FilterSignature['value'];
}

export const isListQueryStringFilterRule = (
	rule: any,
): rule is ListQueryStringFilterObject =>
	rule != null &&
	typeof rule === 'object' &&
	// it has to have an associated field
	!!rule.n &&
	typeof rule.n === 'string' &&
	// it should at least have an operator
	((!!rule.o && typeof rule.o === 'string') ||
		// or a value
		!!rule.v);

export const listFilterQuery = (schema: JSONSchema, rules: JSONSchema[]) => {
	const queryStringFilters = rules.map((filter) => {
		// TODO: The typings need to be fixed in rendition.
		const flatSchema = flattenSchema(schema);
		const flattenFilter = flattenSchema(filter);
		const signatures = decodeFilter(
			flatSchema,
			flattenFilter,
		) as FilterSignature[];
		return signatures.map<ListQueryStringFilterObject>(
			({ field, operator, value }) => ({
				n: field,
				o: operator,
				v: value,
			}),
		);
	});
	return qs.stringify(queryStringFilters);
};

const isQueryStringFilterRuleset = (
	rule: any,
): rule is ListQueryStringFilterObject[] =>
	Array.isArray(rule) &&
	!!rule?.length &&
	rule?.every(isListQueryStringFilterRule);

export const loadRulesFromUrl = (
	searchLocation: string,
	schema: JSONSchema,
): JSONSchema[] => {
	if (!searchLocation) {
		return [];
	}
	const parsed = qs.parse(searchLocation.replace(/^\?/, '')) || {};
	const rules = filter(parsed, isQueryStringFilterRuleset)
		.map((rules: ListQueryStringFilterObject[]) => {
			if (!Array.isArray(rules)) {
				rules = [rules];
			}

			const signatures = rules.map(({ n, o, v }: any) => ({
				field: n,
				operator: o,
				value: v,
			}));
			// full_text_search filter has always a single signature
			// since we cannot add multiple search text filters.
			// TODO: fix in rendition => this should be handled by Rendition, calling the
			// createFilter function handle the case.
			if (signatures[0].operator === FULL_TEXT_SLUG) {
				return createFullTextSearchFilter(
					schema,
					signatures[0].value,
				);
			}
			return createFilter(schema, signatures);
		});

	return rules;
};

type FiltersRequiredProps = Pick<
	FiltersProps,
	'schema' | 'views' | 'filters' | 'onViewsUpdate' | 'onFiltersUpdate'
>;

interface PersistentFiltersHOCExtraProps {
	viewsRestorationKey: string;
	filtersRestorationKey: string;
}

type PersistentFiltersHOCPropsFor<TProps> = TProps &
	PersistentFiltersHOCExtraProps;

interface PersistentFiltersState {
	views: FiltersView[];
	filters: JSONSchema[];
}

export const PersistentFiltersHOC = <TProps extends FiltersRequiredProps>(
	WrappedComponent: React.ComponentType<TProps>,
) => {
	type PersistentFiltersProps = PersistentFiltersHOCPropsFor<TProps>;

	class PersistentFiltersHoc extends React.Component<
		PersistentFiltersProps,
		PersistentFiltersState
	> {
		public removeHistoryListener: UnregisterCallback | undefined;

		constructor(props: PersistentFiltersProps) {
			super(props);

			const views =
				getFromLocalStorage<FiltersView[]>(this.props.viewsRestorationKey) ??
				[];

			const urlRules = loadRulesFromUrl(
				history.location.search,
				this.props.schema,
			);
			const filters = !!urlRules?.length
				? urlRules
				: getFromLocalStorage<JSONSchema[]>(this.props.filtersRestorationKey) ??
				  [];
			this.updateUrl(filters);

			if (!this.props.views && views && this.props.onViewsUpdate) {
				this.props.onViewsUpdate(views);
			}

			if (
				!this.props.filters?.length &&
				filters &&
				this.props.onFiltersUpdate
			) {
				this.props.onFiltersUpdate(filters);
			}

			this.state = {
				views,
				filters,
			};
		}

		setViewsFromStorage = () => {
			const views =
				getFromLocalStorage<FiltersView[]>(this.props.viewsRestorationKey) ??
				[];

			this.setState({ views });
		};

		setFiltersFromStorage = () => {
			const filters =
				getFromLocalStorage<JSONSchema[]>(this.props.filtersRestorationKey) ??
				[];

			this.setState({ filters });
		};

		componentDidMount() {
			window.addEventListener('autoui_views', this.setViewsFromStorage);
			window.addEventListener('autoui_filters', this.setFiltersFromStorage);

			this.removeHistoryListener = history.listen((_location, action) => {
				if (action === 'POP') {
					const filters = loadRulesFromUrl(
						history.location.search,
						this.props.schema,
					);
					this.setState({
						filters,
					});
				}
			});
		}

		componentWillUnmount() {
			window.removeEventListener('autoui_views', this.setViewsFromStorage);
			window.removeEventListener('autoui_filters', this.setFiltersFromStorage);

			setTimeout(() => {
				history.replace(window.location.pathname);
			}, 0);
		}

		public onViewsUpdate = (views: FiltersView[]) => {
			setToLocalStorage(this.props.viewsRestorationKey, views);
			window.dispatchEvent(new Event('autoui_views'));

			if (this.props.onViewsUpdate) {
				this.props.onViewsUpdate(views);
			}
		};

		public onFiltersUpdate = (filters: JSONSchema[]) => {
			setToLocalStorage(this.props.filtersRestorationKey, filters);
			window.dispatchEvent(new Event('autoui_filters'));
			this.updateUrl(filters);

			if (this.props.onFiltersUpdate) {
				this.props.onFiltersUpdate(filters);
			}
		};

		public updateUrl = (filters: JSONSchema[]) => {
			const { pathname } = window.location;

			history.replace({
				pathname,
				search: listFilterQuery(this.props.schema, filters),
			});
		};

		public render() {
			const {
				viewsRestorationKey,
				filtersRestorationKey,
				onViewsUpdate,
				onFiltersUpdate,
				views,
				...restProps
			} = this.props;
			// need the cast b/c of TS issue while reuniting the picked props
			// See: https://github.com/Microsoft/TypeScript/issues/28884
			const props = {
				views: this.props.views || this.state.views,
				onViewsUpdate: this.onViewsUpdate,
				onFiltersUpdate: this.onFiltersUpdate,
				...restProps,
			} as TProps;
			return <WrappedComponent {...props} />;
		}
	}

	return PersistentFiltersHoc;
};

export const PersistentFilters = PersistentFiltersHOC(Filters);
