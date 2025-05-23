import { IExecuteFunctions } from 'n8n-core';
import {
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeApiError,
	NodeOperationError,
} from 'n8n-workflow';
import { NautobotApiClient } from '../../services/NautobotApiClient';

export class Nautobot implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Nautobot',
		name: 'nautobot',
		icon: 'file:nautobot.svg',
		group: ['transform'],
		version: 1,
		description: 'Interact with Nautobot API',
		defaults: {
			name: 'Nautobot Node',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'nautobotApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Get Device',
						value: 'getDevice',
						description: 'Get a device by ID',
						action: 'Get a device by id',
					},
				],
				default: 'getDevice',
				description: 'The operation to perform.',
			},
			{
				displayName: 'Device ID',
				name: 'deviceId',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						operation: ['getDevice'],
					},
				},
				description: 'The ID of the device to retrieve.',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const operation = this.getNodeParameter('operation', 0) as string;
		const credentials = await this.getCredentials('nautobotApi');
		const nautobotApiUrl = credentials.apiUrl as string; // Changed 'url' to 'apiUrl'
		const token = credentials.token as string;

		const apiClient = new NautobotApiClient(nautobotApiUrl, token, this);

		try {
			let result: any;
			if (operation === 'getDevice') {
				const deviceId = this.getNodeParameter('deviceId', 0) as string;
				if (!deviceId) {
					throw new NodeOperationError(this.getNode(), 'Device ID is required for getDevice operation.');
				}
				result = await apiClient.getDevice(deviceId);
			} else {
				throw new NodeOperationError(this.getNode(), `Unsupported operation: ${operation}`);
			}

			if (result === undefined || result === null) {
				return [this.helpers.returnJsonArray([])];
			}

			return [this.helpers.returnJsonArray([result])];

		} catch (error) {
			if (this.continueOnFail()) {
				return [this.helpers.returnJsonArray([{ error: error.message }])];
			}
			// Check if it's an error from the API client (e.g. network error)
			if (error.isAxiosError) { // AxiosError would have this property
				throw new NodeApiError(this.getNode(), error, { message: `Nautobot API request failed: ${error.message}` });
			}
			// For other errors (e.g., operational errors within the node)
			throw new NodeOperationError(this.getNode(), `Error executing Nautobot node: ${error.message}`, { itemIndex: 0 });
		}
	}
}
