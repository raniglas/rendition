import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { ButtonProps, Modal } from 'rendition';

export interface SimpleConfirmationModalProps {
	children: React.ReactNode;
	title?: string | JSX.Element;
	action?: string | JSX.Element;
	primaryButtonProps?: ButtonProps;
	onClose: (confirmed: boolean) => void;
}

export const SimpleConfirmationModal = (
	props: SimpleConfirmationModalProps,
) => {
	const { t } = useTranslation();
	return (
		<Modal
			titleElement={props.title || t('actions_messages.confirmation')}
			cancel={() => props.onClose(false)}
			done={() => props.onClose(true)}
			primaryButtonProps={props.primaryButtonProps}
			action={props.action || t('actions.ok')}
		>
			{props.children}
		</Modal>
	);
};
