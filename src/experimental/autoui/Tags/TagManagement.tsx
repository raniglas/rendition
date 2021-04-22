import { faTags } from '@fortawesome/free-solid-svg-icons/faTags';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import partition from 'lodash/partition';
import * as React from 'react';
import { ResourceTagInfo, TaggedResource } from './models';
import { groupResourcesByTags } from './tag-management-service';
import {
	TagManagementModal,
	TagManagementModalProps,
} from './TagManagementModal';
import { TFunction } from 'i18next';
import { Button, ButtonProps } from '~/components/Button';

export interface TagManagementProps<T extends TaggedResource>
	extends Pick<
		TagManagementModalProps<T>,
		'items' | 'itemType' | 'titleField'
	> {
	tagField: keyof T;
	submitTags: (tagSubmitInfo: Array<ResourceTagInfo<T>>) => void;
	buttonElement?: React.ComponentType<ButtonProps>;
	buttonElementProps?: ButtonProps;
	disabled?: boolean;
	tooltip?: string;
	t: TFunction;
}

interface TagManagementState<T extends TaggedResource> {
	isModalOpen: boolean;
	partialTags: Array<ResourceTagInfo<T>>;
	commonTags: Array<ResourceTagInfo<T>>;
}

export class TagManagement<T extends TaggedResource> extends React.Component<
	TagManagementProps<T>,
	TagManagementState<T>
> {
	constructor(props: TagManagementProps<T>) {
		super(props);

		this.state = {
			isModalOpen: false,
			partialTags: [],
			commonTags: [],
		};
	}

	public isEnabled() {
		return (
			!this.props.disabled &&
			!!this.props.items &&
			!!this.props.items.length &&
			typeof this.props.submitTags === 'function'
		);
	}

	public setTags = (tags: Array<ResourceTagInfo<T>>) => {
		this.setState({ commonTags: tags });
	};

	public openModal() {
		const { items, tagField } = this.props;

		const allTags = groupResourcesByTags(items, tagField);
		const [commonTags, partialTags] = partition(
			allTags,
			(t) => t.items.length === items.length,
		);

		this.setState({ isModalOpen: true, commonTags, partialTags });
	}

	public closeModal = () => {
		this.setState({ isModalOpen: false, commonTags: [], partialTags: [] });
	};

	public submitModal = () => {
		this.props.submitTags(this.state.commonTags);
		this.closeModal();
	};

	public render() {
		const { t } = this.props;
		const buttonIsEnabled = this.isEnabled();
		const tooltip = this.props.tooltip;
		const OpenModalButton = this.props.buttonElement || Button;

		return (
			<>
				<OpenModalButton
					tooltip={tooltip}
					disabled={!buttonIsEnabled}
					icon={<FontAwesomeIcon icon={faTags} />}
					onClick={() => buttonIsEnabled && this.openModal()}
					{...this.props.buttonElementProps}
				>
					{t('labels.tags')}
				</OpenModalButton>

				{this.state.isModalOpen && (
					<TagManagementModal<T>
						t={t}
						items={this.props.items}
						itemType={this.props.itemType}
						titleField={this.props.titleField}
						tags={this.state.commonTags}
						partialTags={this.state.partialTags}
						setTags={this.setTags}
						cancel={this.closeModal}
						done={this.submitModal}
					/>
				)}
			</>
		);
	}
}
