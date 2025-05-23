import {
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class NautobotApi implements ICredentialType {
	name = 'nautobotApi';
	displayName = 'Nautobot API';
	properties: INodeProperties[] = [
		{
			displayName: 'Nautobot URL',
			name: 'apiUrl',
			type: 'string',
			default: '',
			placeholder: 'https://nautobot.example.com',
			description: 'The base URL of the Nautobot instance (e.g., https://nautobot.example.com)',
			required: true,
		},
		{
			displayName: 'API Token',
			name: 'token',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			description: 'The API token for Nautobot',
			required: true,
		},
	];
}
