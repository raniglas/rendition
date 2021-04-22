import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AutoUIContext, BaseResource } from '../schemaOps';
import { faListUl, faMap, faTh } from '@fortawesome/free-solid-svg-icons';
import { ButtonGroup } from '~/components/ButtonGroup';
import { Button } from '~/components/Button';

export enum CollectionLenses {
	Table = 'table',
	Grid = 'grid',
	Map = 'map',
}

const lensIcons = {
	[CollectionLenses.Table]: faListUl,
	[CollectionLenses.Grid]: faTh,
	[CollectionLenses.Map]: faMap,
};

interface LensesProps<T> {
	lens: CollectionLenses;
	changeLens: (lens: CollectionLenses) => void;
	autouiContext: AutoUIContext<T>;
}

export const Lenses = <T extends BaseResource<T>>({
	autouiContext,
	lens,
	changeLens,
}: LensesProps<T>) => {
	const supportedLenses = [CollectionLenses.Table];

	if (autouiContext.cardRenderer) {
		supportedLenses.push(CollectionLenses.Grid);
	}

	if (autouiContext.geolocation) {
		supportedLenses.push(CollectionLenses.Map);
	}

	if (supportedLenses.length <= 1) {
		return null;
	}

	return (
		<ButtonGroup>
			{supportedLenses.map((lensEntry) => {
				return (
					<Button
						quartenary
						outline
						active={lens === lensEntry}
						icon={<FontAwesomeIcon icon={(lensIcons as any)[lensEntry]} />}
						onClick={() => changeLens(lensEntry)}
					/>
				);
			})}
		</ButtonGroup>
	);
};
