import { BalenaSdk } from '~/services/balena-sdk';
import { BaseResource, RawAutoUIModel } from '../schemaOps';
import { defaultPermissions } from './helpers';

export interface AugmentedApiKey
	extends BalenaSdk.ApiKey,
		BaseResource<AugmentedApiKey> {}

export const model: RawAutoUIModel<BalenaSdk.ApiKey> = {
	resource: 'apiKey',
	schema: {
		type: 'object',
		required: ['id', 'name'],
		properties: {
			id: {
				title: 'Id',
				type: 'number',
			},
			name: {
				title: 'Name',
				type: 'string',
			},
			created_at: {
				title: 'Date added',
				type: 'string',
				format: 'date-time',
			},
			description: {
				title: 'Description',
				type: 'string',
			},
		},
	},
	permissions: {
		default: defaultPermissions,
		administrator: {
			read: ['id', 'name', 'created_at', 'description'],
			create: ['name', 'description'],
			update: ['name', 'description'],
			delete: true,
		},
	},
	priorities: {
		primary: ['name'],
		secondary: ['created_at', 'description'],
		tertiary: [],
	},
};

export const transformers = {
	__permissions: () => model.permissions.administrator,
};
