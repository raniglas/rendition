import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import {
	AutoUIContext,
	AutoUIModel,
	BaseResource,
	pick,
} from '../../schemaOps';
import { ActionData } from '..';
import { getUpdateDeleteDisabledReason } from '../../utils';
import { TFunction } from 'i18next';
import { Button } from '~/components/Button';
import { DropDownButton } from '~/components/DropDownButton';
import { faEllipsisH } from '@fortawesome/free-solid-svg-icons';

interface UpdateProps<T extends BaseResource<T>> {
	model: AutoUIModel<T>;
	autouiContext: AutoUIContext<T>;
	selected: T[];
	hasOngoingAction: boolean;
	onActionTriggered: (data: ActionData<T>) => void;
	t: TFunction;
}

export const Update = <T extends BaseResource<T>>({
	model,
	autouiContext,
	selected,
	hasOngoingAction,
	onActionTriggered,
	t,
}: UpdateProps<T>) => {
	const { actions } = autouiContext;
	const updateActions = actions
		?.filter((action) => action.type === 'update' || action.type === 'delete')
		.sort((a) => (a.type === 'delete' ? 1 : -1))
		.sort((a) => (a.isDangerous ? 1 : a.type === 'delete' ? 0 : -1));

	if (!updateActions || updateActions.length < 1) {
		return null;
	}

	const actionHandlers = updateActions.map((action) => {
		const disabledReason =
			getUpdateDeleteDisabledReason(
				selected,
				hasOngoingAction,
				action.type as 'update' | 'delete',
				t,
			) ?? action.isDisabled?.({ affectedEntries: selected });

		return (
			<Button
				key={action.title}
				data-action={`${action.type}-${model.resource}`}
				onClick={() =>
					onActionTriggered({
						action,
						schema:
							action.type === 'delete'
								? {}
								: pick(model.schema, model.permissions[action.type]),
						affectedEntries: selected,
					})
				}
				tooltip={
					typeof disabledReason === 'string' ? disabledReason : undefined
				}
				disabled={!!disabledReason}
				plain={updateActions.length > 1}
				danger={action.isDangerous}
			>
				{action.title}
			</Button>
		);
	});

	if (actionHandlers.length === 1) {
		return actionHandlers[0];
	}

	const disabledReason = getUpdateDeleteDisabledReason(
		selected,
		hasOngoingAction,
		null,
		t,
	);

	return (
		<DropDownButton
			ml={2}
			compact={[true, true, false, false]}
			joined
			outline
			quartenary
			disabled={!!disabledReason}
			tooltip={disabledReason}
			icon={<FontAwesomeIcon icon={faEllipsisH} />}
			label={'Actions'}
		>
			{actionHandlers}
		</DropDownButton>
	);
};
