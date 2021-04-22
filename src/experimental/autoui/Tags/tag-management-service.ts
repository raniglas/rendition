import {
	ResourceTagInfo,
	ResourceTagSubmitInfo,
	SubmitInfo,
	TaggedResource,
} from './models';
import { limitedMap } from '~/utils';
import keys from 'lodash/keys';
import flatMap from 'lodash/flatMap';
import map from 'lodash/map';
import groupBy from 'lodash/groupBy';
import get from 'lodash/get';

export const getTagKeyValueComposite = (tagKey: string, value: string) =>
	`${tagKey}: ${value}`;

export const getResourceTags = <T extends TaggedResource, P extends keyof T>(
	item: T,
	tagField: P,
) => get(item as {}, tagField);

export const groupResourcesByTags = <
	T extends TaggedResource,
	P extends keyof T
>(
	items: T[],
	tagField: P,
) => {
	const resourceTagInfos = flatMap(items, (item) => {
		const tags = getResourceTags(item, tagField);
		return tags.map((tag: any) => ({
			tag_key_value: getTagKeyValueComposite(tag.tag_key, tag.value),
			tag_key: tag.tag_key,
			value: tag.value,
			item,
		}));
	});

	const tagsByTagKeyValue = groupBy(resourceTagInfos, 'tag_key_value');
	const tagsWithItems = map(keys(tagsByTagKeyValue).sort(), (tagKeyValue) => {
		const tags = tagsByTagKeyValue[tagKeyValue];
		const firstTag = tags[0];
		return {
			tag_key: firstTag.tag_key,
			value: firstTag.value,
			items: map(tags, 'item'),
		} as ResourceTagInfo<T>;
	});

	return tagsWithItems;
};

export const getResourceTagSubmitInfo = <T extends TaggedResource>(
	tags: Array<ResourceTagInfo<T>>,
) => {
	const submitInfo: SubmitInfo<ResourceTagSubmitInfo, ResourceTagSubmitInfo> = {
		added: [],
		updated: [],
		deleted: [],
	};

	tags.forEach((tag) => {
		if (tag.state && tag.state in submitInfo) {
			Array.prototype.push.apply(
				submitInfo[tag.state],
				tag.items.map<ResourceTagSubmitInfo>((item) => ({
					resourceId: item.id,
					tag_key: tag.tag_key,
					value: tag.value,
				})),
			);
		}
	});

	return submitInfo;
};

export interface ResourceTagModelService {
	set(resourceId: number, tagKey: string, value: string): Promise<void>;
	remove(nameOrId: string | number, tagKey: string): Promise<void>;
}

const DEFAULT_MAX_CONCURRENT_REQUESTS = 50;

export const submitResourceTagInfos = (
	tagService: ResourceTagModelService,
	tagSubmitInfo: SubmitInfo<ResourceTagSubmitInfo, ResourceTagSubmitInfo>,
	concurrency = DEFAULT_MAX_CONCURRENT_REQUESTS,
) => {
	const operations = flatMap([
		tagSubmitInfo.added.map((x) => () =>
			tagService.set(x.resourceId, x.tag_key, x.value),
		),
		tagSubmitInfo.updated.map((x) => () =>
			tagService.set(x.resourceId, x.tag_key, x.value),
		),
		tagSubmitInfo.deleted.map((x) => () =>
			tagService.remove(x.resourceId, x.tag_key),
		),
	]);
	return limitedMap(operations, (op) => op(), concurrency);
};

export const submitResourceTags = <T extends TaggedResource>(
	tagService: ResourceTagModelService,
	resourceTags: Array<ResourceTagInfo<T>>,
	concurrency?: number,
) => {
	const submitInfo = getResourceTagSubmitInfo(resourceTags);
	return submitResourceTagInfos(tagService, submitInfo, concurrency);
};
