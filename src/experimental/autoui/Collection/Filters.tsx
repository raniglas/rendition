import React from 'react';
import { JSONSchema7 as JSONSchema } from 'json-schema';
// TODO: Move persistence to rendition
import { PersistentFilters } from './PersistentFilters';
import { AutoUIContext, BaseResource } from '../schemaOps';
import { FilterRenderMode } from '~/components/Filters';


interface FiltersProps<T> {
	schema: JSONSchema;
	filters: JSONSchema[];
	autouiContext: AutoUIContext<T>;
	changeFilters: (filters: JSONSchema[]) => void;
	renderMode?: FilterRenderMode;
}

export const Filters = <T extends BaseResource<T>>({
	schema,
	filters,
	changeFilters,
	autouiContext,
	renderMode,
}: FiltersProps<T>) => {
	return (
		<PersistentFilters
			compact={[true, true, false, false]}
			viewsRestorationKey={`${autouiContext.resource}__views`}
			filtersRestorationKey={`${autouiContext.resource}__filters`}
			schema={schema}
			filters={filters}
			onFiltersUpdate={changeFilters}
			addFilterButtonProps={{ outline: true }}
			renderMode={renderMode ?? ['add', 'search', 'views']}
		/>
	);
};
