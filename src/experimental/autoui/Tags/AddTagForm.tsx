import * as React from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import styled from 'styled-components';
import * as uuid from 'uuid';

import { ResourceTagInfo } from './models';
import some from 'lodash/some';
import find from 'lodash/find';
import debounce from 'lodash/debounce';
import startsWith from 'lodash/startsWith';
import isEmpty from 'lodash/isEmpty';
import { Alert as AlertBase } from '~/components/Alert';
import { Txt } from '~/components/Txt';
import { Input } from '~/components/Input';
import { Button } from '~/components/Button';
import { SimpleConfirmationModal, SimpleConfirmationModalProps } from '../Modals/SimpleConfirmationModal';
import { withPreventDefault, stopKeyDownEvent } from '~/utils'

const Alert = styled(AlertBase)`
	padding: 8px 0 18px;
`;

const NewTagTr = styled.tr`
	table > thead > & > td {
		padding-top: 0;
		padding-bottom: 0;
	}
`;

const NewTagErrorsTr = styled.tr`
	table > thead > & > td {
		height: 30px;
		padding-top: 5px;
		padding-bottom: 5px;
	}
`;

const RESERVED_NAMESPACE = 'io.resin.';

const getDefaultState = () => ({
	tagKey: '',
	value: '',
	tagKeyIsInvalid: false,
	error: undefined,
	canSubmit: false,
});

interface AddTagFormProps<T> extends WithTranslation {
	itemType: string;
	existingTags: Array<ResourceTagInfo<T>>;
	overwritableTags?: Array<ResourceTagInfo<T>>;
	addTag: (tag: ResourceTagInfo<T>) => void;
}

interface AddTagFormState {
	tagKey: string;
	value: string;
	tagKeyIsInvalid: boolean;
	error?: { message: string };
	canSubmit: boolean;
	confirmationModalOptions?: SimpleConfirmationModalProps;
}

class AddTagForm<T> extends React.Component<
	AddTagFormProps<T>,
	AddTagFormState
> {
	private tagKeyInput: HTMLElement | null = null;
	private valueInput: HTMLElement | null = null;
	private formUuid: string = `add-tag-form-${uuid.v1()}`;

	constructor(props: AddTagFormProps<T>) {
		super(props);
		this.state = getDefaultState();
	}

	public setNewTagProps(
		state: Partial<{
			tagKey: string;
			value: string;
		}>,
	) {
		this.setState(state as Pick<AddTagFormState, keyof AddTagFormState>, () =>
			this.checkNewTagValidityDebounced(),
		);
	}

	private newTagValidationRules = () => {
		const { t } = this.props;
		return [
			{
				test: () => !this.state.tagKey || isEmpty(this.state.tagKey),
				message: t('fields_errors.tag_name_cannot_be_empty'),
			},
			{
				test: () => /\s/.test(this.state.tagKey),
				message: t('fields_errors.tag_names_cannot_contain_whitespace'),
			},
			{
				test: () => startsWith(this.state.tagKey, RESERVED_NAMESPACE),
				message: t(`fields_errors.some_tag_keys_are_reserved`, {
					namespace: RESERVED_NAMESPACE,
				}),
			},
			{
				test: () =>
					some(
						this.props.existingTags,
						(tag) =>
							tag.state !== 'deleted' && tag.tag_key === this.state.tagKey,
					),
				message: t('fields_errors.tag_with_same_name_exists'),
			},
		];
	};

	public checkNewTagValidity() {
		const failedRule = this.newTagValidationRules().find((rule) => rule.test());

		const hasErrors = !!failedRule;

		this.setState({
			tagKeyIsInvalid: hasErrors,
			error: failedRule,
			canSubmit: !hasErrors,
		});
		return hasErrors;
	}

	public checkNewTagValidityDebounced = debounce(
		() => this.checkNewTagValidity(),
		500,
	);

	public async checkTagOverwrites() {
		const overwritableTag = find(this.props.overwritableTags || [], {
			tag_key: this.state.tagKey,
		});

		if (!overwritableTag) {
			return true;
		}
		const count = overwritableTag.items.length;
		const { itemType, t } = this.props;
		const result = await new Promise<boolean>((resolve) => {
			const confirmationModalOptions = {
				title: t('warnings.this_would_overwrite_tags', {
					itemType,
					count,
				}),
				children: (
					<Txt>
						{t(`warnings.tag_name_group_exists_and_will_be_overwritten`, {
							itemType,
							count,
						})}
						<br />
						{t('actions_confirmations.confirm_to_proceed')}
					</Txt>
				),
				action: t('actions.continue'),
				onClose: resolve,
			} as SimpleConfirmationModalProps;

			this.setState({ confirmationModalOptions });
		});
		this.setState({ confirmationModalOptions: undefined });
		return result;
	}

	public addTag = withPreventDefault(() => {
		if (this.checkNewTagValidity()) {
			return;
		}

		return this.checkTagOverwrites().then((confirmed) => {
			if (!confirmed) {
				return;
			}

			this.props.addTag({
				tag_key: this.state.tagKey,
				value: this.state.value,
			} as ResourceTagInfo<T>);
			this.setState(getDefaultState());

			if (this.tagKeyInput) {
				this.tagKeyInput.blur();
			}
			if (this.valueInput) {
				this.valueInput.blur();
			}
		});
	});

	public render() {
		const { t } = this.props;
		return (
			<thead>
				<NewTagTr onKeyDown={(e) => stopKeyDownEvent(e, 13, this.addTag)}>
					<td />
					<td>
						<Input
							form={this.formUuid}
							width="100%"
							ref={(input) => (this.tagKeyInput = input)}
							onChange={(e) => this.setNewTagProps({ tagKey: e.target.value })}
							value={this.state.tagKey}
							invalid={this.state.tagKeyIsInvalid}
							placeholder={t('labels.tag_name')}
						/>
					</td>
					<td>
						<Input
							form={this.formUuid}
							width="100%"
							ref={(input) => (this.valueInput = input)}
							onChange={(e) => this.setNewTagProps({ value: e.target.value })}
							value={this.state.value}
							placeholder={t('labels.value')}
						/>
					</td>
					<td>
						<form id={this.formUuid} onSubmit={this.addTag}>
							<Button
								width="120px"
								tertiary
								onClick={this.addTag}
								disabled={!this.state.canSubmit}
							>
								{t('actions.add_tag')}
							</Button>
						</form>
						{this.state.confirmationModalOptions && (
							<SimpleConfirmationModal
								{...this.state.confirmationModalOptions}
							/>
						)}
					</td>
				</NewTagTr>
				<NewTagErrorsTr>
					<td />
					<td colSpan={2}>
						{this.state.error && (
							<Alert danger plaintext>
								{this.state.error.message}
							</Alert>
						)}
					</td>
					<td />
				</NewTagErrorsTr>
			</thead>
		);
	}
}

const TranslatedAddTagForm = withTranslation()(AddTagForm) as new <
	T
>() => React.Component<Omit<AddTagFormProps<T>, keyof WithTranslation>>;

export { TranslatedAddTagForm as AddTagForm };
