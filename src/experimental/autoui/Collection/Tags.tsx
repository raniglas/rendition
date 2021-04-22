import { TFunction } from 'i18next';
import React from 'react';
// TODO: Move to rendition
import { AutoUIContext, BaseResource } from '../schemaOps';
import { ResourceTagInfo } from '../Tags/models';
import { TagManagement } from '../Tags/TagManagement';
import { getTagsDisabledReason } from '../utils';

interface TagsProps<T> {
	selected: T[];
	autouiContext: AutoUIContext<T>;
	changeTags: (tags: Array<ResourceTagInfo<T>>) => void;
	t: TFunction;
}

export const Tags = <T extends BaseResource<T>>({
	selected,
	autouiContext,
	changeTags,
	t,
}: TagsProps<T>) => {
	if (!autouiContext.tagField || !autouiContext.nameField) {
		return null;
	}

	const disabledReason = getTagsDisabledReason(
		selected,
		autouiContext.tagField as keyof T,
		t,
	);

	return (
		<TagManagement
			t={t}
			tooltip={disabledReason}
			disabled={!!disabledReason}
			buttonElementProps={{ quartenary: true, outline: true }}
			items={selected}
			itemType={autouiContext.resource}
			titleField={autouiContext.nameField as keyof T}
			tagField={autouiContext.tagField as keyof T}
			submitTags={changeTags}
		/>
	);
};
