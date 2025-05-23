import { IDataObject, IHttpRequestOptions } from 'n8n-workflow';
import { IExecuteFunctions } from 'n8n-core';

export class NautobotApiClient {
	private baseUrl: string;
	private token: string;
	private executeFunctions: IExecuteFunctions;

	constructor(
		baseUrl: string,
		token: string,
		executeFunctions: IExecuteFunctions,
	) {
		this.baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
		this.token = token;
		this.executeFunctions = executeFunctions;
	}

	private async apiRequest(
		method: string,
		endpoint: string,
		body?: IDataObject,
		qs?: IDataObject,
	): Promise<any> {
		const options: IHttpRequestOptions = {
			method,
			url: `${this.baseUrl}/api${endpoint}`,
			headers: {
				'Authorization': `Token ${this.token}`,
				'Content-Type': 'application/json',
				'Accept': 'application/json',
			},
			body,
			qs,
			json: true,
		};

		try {
			const response = await this.executeFunctions.helpers.request(options);
			return response;
		} catch (error) {
			// Log the error or handle it as needed
			throw error;
		}
	}

	async getDevice(id: string): Promise<any> {
		return this.apiRequest('GET', `/dcim/devices/${id}/`);
	}

	async listDevices(params?: IDataObject): Promise<any> {
		return this.apiRequest('GET', '/dcim/devices/', undefined, params);
	}

	// Placeholder for other methods like createDevice, updateDevice, deleteDevice, etc.
	// async createDevice(data: IDataObject): Promise<any> {
	// 	return this.apiRequest('POST', '/dcim/devices/', data);
	// }

	// async updateDevice(id: string, data: IDataObject): Promise<any> {
	// 	return this.apiRequest('PUT', `/dcim/devices/${id}/`, data);
	// }

	// async deleteDevice(id: string): Promise<any> {
	// 	return this.apiRequest('DELETE', `/dcim/devices/${id}/`);
	// }
}
