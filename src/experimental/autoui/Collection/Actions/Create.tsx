import React from 'react';
import {
	AutoUIContext,
	AutoUIModel,
	BaseResource,
	pick,
} from '../../schemaOps';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ActionData } from '..';

import { TFunction } from 'i18next';
import { getCreateDisabledReason } from '../../utils';
import { Button } from '~/components/Button';
import { faMagic } from '@fortawesome/free-solid-svg-icons';

interface CreateProps<T extends BaseResource<T>> {
	model: AutoUIModel<T>;
	autouiContext: AutoUIContext<T>;
	hasOngoingAction: boolean;
	onActionTriggered: (data: ActionData<T>) => void;
	t: TFunction;
}

export const Create = <T extends BaseResource<T>>({
	model,
	autouiContext,
	hasOngoingAction,
	onActionTriggered,
	t,
}: CreateProps<T>) => {
	const { actions } = autouiContext;
	const createActions = actions?.filter((action) => action.type === 'create');

	if (!createActions || createActions.length < 1) {
		return null;
	}

	if (createActions.length > 1) {
		throw new Error('Only one create action per resource is allowed');
	}

	const disabledReason = !!createActions[0].isDisabled
		? createActions[0].isDisabled({})
		: getCreateDisabledReason(model.permissions, hasOngoingAction, t);

	return (
		<Button
			data-action={`create-${model.resource}`}
			onClick={() =>
				onActionTriggered({
					action: createActions[0],
					schema: pick(model.schema, model.permissions.create),
				})
			}
			icon={<FontAwesomeIcon icon={faMagic} />}
			tooltip={typeof disabledReason === 'string' ? disabledReason : undefined}
			disabled={!!disabledReason}
			primary
		>
			{createActions[0].title}
		</Button>
	);
};
