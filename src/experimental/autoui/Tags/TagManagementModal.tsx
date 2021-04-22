import { faTrashAlt } from '@fortawesome/free-solid-svg-icons/faTrashAlt';
import { faUndo } from '@fortawesome/free-solid-svg-icons/faUndo';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as React from 'react';
import styled from 'styled-components';
import { stopKeyDownEvent, withPreventDefault } from '~/utils';
import { AddTagForm } from './AddTagForm';
import { ResourceTagInfo, ResourceTagInfoState } from './models';
import map from 'lodash/map';
import sortBy from 'lodash/sortBy';
import find from 'lodash/find';
import toString from 'lodash/toString';
import { TFunction } from 'i18next';
import { faPencilAlt } from '@fortawesome/free-solid-svg-icons';
import { Theme } from '~/index';
import { Heading } from '~/components/Heading';
import { Modal } from '~/components/Modal';
import { Flex } from '~/components/Flex';
import { Input } from '~/components/Input';
import { Button } from '~/components/Button';
import { CollectionSummary } from '../CollectionSummary/CollectionSummary';

const NBSP = '\u00a0';

const iconStyles = `
	font-size: 14px;
	color: ${Theme.colors.text.main};
`;

const FaPencil = (props: any) => <FontAwesomeIcon icon={faPencilAlt} {...props} />;

const EditButtonIcon = styled(FaPencil)`
	${iconStyles} margin-left: 10px;
`;

const FaTrashAlt = (props: any) => (
	<FontAwesomeIcon icon={faTrashAlt} {...props} />
);

const DeleteButtonIcon = styled(FaTrashAlt)`
	${iconStyles};
`;

export const UndoButtonMinWidth = 100;

const UndoButton = styled(Button)`
	width: ${UndoButtonMinWidth}px;
	text-align: left;
`;

const InputPadder = styled.div`
	padding-left: 17px;
	padding-right: 17px;
`;

const TdThHorizontalPadding = 10;

const TagTable = styled.table`
	width: 100%;
	max-width: 100%;
	border: none;
	font-size: 14px;

	& > thead > tr > th,
	& > thead > tr > td {
		padding: 11px ${TdThHorizontalPadding}px;
	}

	& > thead > tr > th {
		height: 42px;
		font-size: 16px;
		font-weight: bold;
		background-color: #f2f2f2;
	}

	& > tbody > tr > td {
		padding: 8px ${TdThHorizontalPadding}px;
		height: 50px;
	}

	& > tbody > tr:nth-of-type(even) {
		background-color: #f8f8f8;
	}

	& > thead > tr > th,
	& > tbody > tr > td {
		border: none;
		vertical-align: middle;
	}
`;

const TagTr = styled.tr`
	&:hover {
		${DeleteButtonIcon}, ${EditButtonIcon} {
			opacity: 0.7;
		}
	}

	${DeleteButtonIcon}, ${EditButtonIcon} {
		opacity: 0;
		cursor: pointer;

		&:hover {
			opacity: 1;
		}
	}
`;

const TagDeleteTh = styled.th`
	width: 36px;
`;

const TagDeleteTd = styled(TagDeleteTh.withComponent('td'))`
	table > tbody > tr > & {
		padding-left: 11px;
		padding-right: 11px;
	}
`;

const TagPropertyTh = styled.th`
	width: 30%;
	max-width: 300px;
	text-align: left;
`;

const TagPropertyTd = TagPropertyTh.withComponent('td');

const TagKeyTd = styled(TagPropertyTd)`
	font-weight: bold;
`;

const TagValueTd = styled(TagPropertyTd)``;

const TagProperty = styled.div<{ state?: ResourceTagInfoState }>`
	display: flex;
	max-width: 100%;

	color: ${(props) =>
		props.state === 'added'
			? Theme.colors.warning.main
			: props.state === 'updated'
			? Theme.colors.warning.main
			: props.state === 'deleted'
			? Theme.colors.gray.main
			: 'inherit'};

	${TagKeyTd} > & {
		color: ${(props) =>
			props.state === 'added' ? Theme.colors.warning.main : 'inherit'};
	}

	& > ${InputPadder} {
		overflow: hidden;
		white-space: nowrap;
		text-overflow: ellipsis;
	}
`;

const EdittableTagValue = styled(TagProperty)`
	display: flex;
	cursor: pointer;

	& > ${InputPadder} {
		display: inline-flex;
		align-items: center;
		justify-content: flex-start;
		max-width: 100%;
	}
`;

const EdittableTagValueText = styled.div`
	flex: 1;
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
`;

const lineThrough = `
	position: relative;

	&:after {
		content: '';
		position: absolute;
		left: 0;
		right: 0;
		display: block;
		background: ${Theme.colors.warning.main};
		height: 2px;
		top: 50%;
	}
`;

const PreviousTagProperty = styled(TagProperty)`
	display: inline-flex;
	width: 100%;
	margin-bottom: ${(props) => (props.state === 'deleted' ? 0 : 6)}px;

	${lineThrough} ${TagKeyTd} > &, ${TagValueTd} > & {
		color: ${Theme.colors.gray.main};
	}

	${TagKeyTd} > &:after {
		right: ${-TdThHorizontalPadding}px;
	}

	${TagValueTd} > & {
		width: auto;
		&:after {
			left: ${-TdThHorizontalPadding}px;
		}
	}
`;

const TagUndoChangedTh = styled.th`
	min-width: ${UndoButtonMinWidth}px;
`;

const TagUndoChangedTd = styled(TagUndoChangedTh.withComponent('td'))`
	text-align: right;
`;

export interface TagManagementModalProps<T> {
	items: T[];
	itemType: string;
	titleField: keyof T | ((item: T) => string);
	tags: Array<ResourceTagInfo<T>>;
	partialTags?: Array<ResourceTagInfo<T>>;
	setTags: (tags: Array<ResourceTagInfo<T>>) => void;
	cancel: () => any;
	done: () => any;
	t: TFunction;
}

interface TagManagementModalState<T> {
	edittingTag?: ResourceTagInfo<T>;
}

const getDefaultState = () => ({
	edittingTag: undefined,
});

export class TagManagementModal<T> extends React.Component<
	TagManagementModalProps<T>,
	TagManagementModalState<T>
> {
	constructor(props: TagManagementModalProps<T>) {
		super(props);

		this.state = getDefaultState();
	}

	public addTag = (tag: ResourceTagInfo<T>) => {
		const items = this.props.items;
		let tags = this.props.tags.slice();

		const existingDeletedTag = find(
			this.props.tags,
			(existingTag) =>
				existingTag.state === 'deleted' && existingTag.tag_key === tag.tag_key,
		);
		if (existingDeletedTag) {
			existingDeletedTag.initialValue = existingDeletedTag.value;
			existingDeletedTag.value = tag.value;
			existingDeletedTag.state = 'updated';
		} else {
			const newTag: ResourceTagInfo<T> = {
				tag_key: tag.tag_key,
				value: tag.value,
				items: items.slice(),
				state: 'added',
			};

			tags.push(newTag);
			tags = sortBy(tags, 'tag_key');
		}

		this.setState(getDefaultState());
		this.props.setTags(tags);
	};

	public undoTagChanges(tag: ResourceTagInfo<T>) {
		if (tag.state === 'added') {
			this.props.setTags(this.props.tags.filter((t) => t !== tag));
			return;
		}
		if (tag.state === 'updated') {
			tag.value = tag.initialValue || '';
			tag.state = undefined;
		}
		if (tag.state === 'deleted') {
			tag.state = undefined;
		}
		this.props.setTags(this.props.tags.slice());
	}

	public startTagEdit(tag: ResourceTagInfo<T>) {
		if (tag && tag.initialValue === undefined) {
			tag.initialValue = tag.value || '';
		}
		this.setState({ edittingTag: tag });
	}

	public endTagEdit = () => {
		if (this.state.edittingTag) {
			this.props.setTags(this.props.tags.slice());
		}
		this.setState({ edittingTag: undefined });
	};

	public setEdittingTagValue(value: string) {
		if (!this.state.edittingTag) {
			return;
		}

		this.state.edittingTag.value = value;
		if (
			!this.state.edittingTag.state &&
			this.state.edittingTag.initialValue !== value
		) {
			this.state.edittingTag.state = 'updated';
		}
		this.setState({ edittingTag: this.state.edittingTag });
	}

	public deleteTag(tag: ResourceTagInfo<T>) {
		if (tag.state === 'added') {
			this.props.setTags(this.props.tags.filter((t) => t !== tag));
			return;
		}

		tag.state = 'deleted';
		this.props.setTags(this.props.tags.slice());
	}

	public submitModal = withPreventDefault(this.props.done);

	public render() {
		const { items, itemType, t, titleField } = this.props;
		const getItemTitle = (item: T) => {
			const title =
				typeof titleField === 'function'
					? titleField(item)
					: toString(item[titleField]);
			return title || `(${t('no_data.no_name_set')})`;
		};

		return (
			<Modal
				width={1000}
				titleElement={
					<div>
						<Heading.h3 mt={0} mb={10}>
							{items.length > 1 && <span>{t('labels.shared')} </span>}
							{t('labels.tags')}
						</Heading.h3>
						<CollectionSummary
							items={items.map(getItemTitle).sort()}
							itemsType={itemType}
							maxVisibleItemCount={10}
						/>
					</div>
				}
				cancel={this.props.cancel}
				done={this.submitModal}
				action={t(`actions.apply_item_type_count`, {
					count: items.length,
					itemType: t('labels.' + itemType, {
						count: items.length,
					}).toLowerCase(),
				})}
			>
				<Flex>
					<TagTable>
						<AddTagForm<T>
							itemType={itemType}
							existingTags={this.props.tags}
							overwritableTags={this.props.partialTags}
							addTag={this.addTag}
						/>
						<thead>
							<tr>
								<TagDeleteTh />
								<TagPropertyTh>
									<InputPadder>{t('labels.tag_name')}</InputPadder>
								</TagPropertyTh>
								<TagPropertyTh>
									<InputPadder>{t('labels.value')}</InputPadder>
								</TagPropertyTh>
								<TagUndoChangedTh />
							</tr>
						</thead>
						<tbody>
							{!this.props.tags.length ? (
								<tr>
									<td />
									<td colSpan={3}>
										<InputPadder>
											{t(`errors.no_tags_for_selected_itemtype`, {
												count: items.length,
												itemType,
											})}
										</InputPadder>
									</td>
								</tr>
							) : (
								map(this.props.tags, (tag) => {
									const showPreviousTagProperties =
										this.state.edittingTag !== tag &&
										(tag.state === 'deleted' || tag.state === 'updated');
									return (
										<TagTr key={tag.tag_key} {...tag}>
											<TagDeleteTd>
												{tag.state !== 'deleted' && (
													<Flex alignItems="center">
														<DeleteButtonIcon
															onClick={() => this.deleteTag(tag)}
														/>
													</Flex>
												)}
											</TagDeleteTd>
											<TagKeyTd>
												{showPreviousTagProperties && (
													<PreviousTagProperty state={tag.state}>
														<InputPadder>{tag.tag_key}</InputPadder>
													</PreviousTagProperty>
												)}
												{tag.state !== 'deleted' && (
													<TagProperty state={tag.state}>
														<InputPadder>{tag.tag_key}</InputPadder>
													</TagProperty>
												)}
											</TagKeyTd>
											<TagValueTd>
												{showPreviousTagProperties && (
													<PreviousTagProperty state={tag.state}>
														<InputPadder>{tag.value || NBSP}</InputPadder>
													</PreviousTagProperty>
												)}
												{this.state.edittingTag !== tag &&
													tag.state !== 'deleted' && (
														<EdittableTagValue
															state={tag.state}
															onClick={() => this.startTagEdit(tag)}
														>
															<InputPadder>
																<EdittableTagValueText>
																	{tag.value || NBSP}
																</EdittableTagValueText>
																<EditButtonIcon />
															</InputPadder>
														</EdittableTagValue>
													)}
												{this.state.edittingTag === tag && (
													<Input
														width="100%"
														autoFocus
														onKeyDown={(e) =>
															stopKeyDownEvent(e, 13, this.endTagEdit)
														}
														onFocus={(e) => {
															// move the cursor to the end
															const target = e.target as HTMLInputElement;
															const len = (target.value || '').length;
															if (len) {
																target.setSelectionRange(len, len);
															}
														}}
														onChange={(e) =>
															this.setEdittingTagValue(e.target.value)
														}
														onBlur={() => this.endTagEdit()}
														value={this.state.edittingTag.value}
														placeholder={t('labels.tag_value')}
													/>
												)}
											</TagValueTd>
											<TagUndoChangedTd>
												{tag.state && (
													<Flex alignItems="center" justifyContent="flex-end">
														<UndoButton
															plain
															primary
															icon={<FontAwesomeIcon icon={faUndo} />}
															onClick={() => this.undoTagChanges(tag)}
														>
															<span>
																{tag.state === 'added'
																	? t('actions.undo_add')
																	: tag.state === 'updated'
																	? t('actions.undo_edit')
																	: t('actions.undo_delete')}
															</span>
														</UndoButton>
													</Flex>
												)}
											</TagUndoChangedTd>
										</TagTr>
									);
								})
							)}
						</tbody>
					</TagTable>
				</Flex>
			</Modal>
		);
	}
}
