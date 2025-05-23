import { IExecuteFunctions, IHttpRequestOptions } from 'n8n-workflow';
import { NautobotApiClient } from './NautobotApiClient';

// Mock IExecuteFunctions
const mockExecuteFunctions = {
	helpers: {
		request: jest.fn(),
	},
} as unknown as IExecuteFunctions;

describe('NautobotApiClient', () => {
	let client: NautobotApiClient;
	const baseUrl = 'http://localhost:8000';
	const token = 'testToken';

	beforeEach(() => {
		// Reset mocks before each test
		jest.clearAllMocks();
		client = new NautobotApiClient(baseUrl, token, mockExecuteFunctions);
	});

	describe('constructor', () => {
		it('should correctly initialize with base URL and token', () => {
			expect(client['baseUrl']).toBe(baseUrl); // Accessing private member for test
			expect(client['token']).toBe(token);
		});

		it('should remove trailing slash from baseUrl', () => {
			const clientWithTrailingSlash = new NautobotApiClient(
				baseUrl + '/',
				token,
				mockExecuteFunctions,
			);
			expect(clientWithTrailingSlash['baseUrl']).toBe(baseUrl);
		});
	});

	describe('apiRequest', () => {
		it('should make a GET request with correct headers and URL', async () => {
			const endpoint = '/dcim/devices/';
			const expectedUrl = `${baseUrl}/api${endpoint}`;
			const mockResponseData = { id: 'device1' };
			(mockExecuteFunctions.helpers.request as jest.Mock).mockResolvedValueOnce(
				mockResponseData,
			);

			const result = await client['apiRequest']('GET', endpoint); // Accessing private method

			expect(mockExecuteFunctions.helpers.request).toHaveBeenCalledTimes(1);
			const requestOptions = (mockExecuteFunctions.helpers.request as jest.Mock)
				.mock.calls[0][0] as IHttpRequestOptions;
			expect(requestOptions.method).toBe('GET');
			expect(requestOptions.url).toBe(expectedUrl);
			expect(requestOptions.headers?.['Authorization']).toBe(`Token ${token}`);
			expect(requestOptions.headers?.['Content-Type']).toBe('application/json');
			expect(requestOptions.headers?.['Accept']).toBe('application/json');
			expect(requestOptions.body).toBeUndefined();
			expect(requestOptions.qs).toBeUndefined();
			expect(result).toEqual(mockResponseData);
		});

		it('should include body for POST/PUT requests', async () => {
			const endpoint = '/dcim/devices/';
			const body = { name: 'New Device' };
			(mockExecuteFunctions.helpers.request as jest.Mock).mockResolvedValueOnce({});

			await client['apiRequest']('POST', endpoint, body); // Accessing private method

			expect(mockExecuteFunctions.helpers.request).toHaveBeenCalledTimes(1);
			const requestOptions = (mockExecuteFunctions.helpers.request as jest.Mock)
				.mock.calls[0][0] as IHttpRequestOptions;
			expect(requestOptions.body).toEqual(body);
		});

		it('should include query string for GET requests if provided', async () => {
			const endpoint = '/dcim/devices/';
			const qs = { site: 'ams01' };
			(mockExecuteFunctions.helpers.request as jest.Mock).mockResolvedValueOnce([]);

			await client['apiRequest']('GET', endpoint, undefined, qs); // Accessing private method

			expect(mockExecuteFunctions.helpers.request).toHaveBeenCalledTimes(1);
			const requestOptions = (mockExecuteFunctions.helpers.request as jest.Mock)
				.mock.calls[0][0] as IHttpRequestOptions;
			expect(requestOptions.qs).toEqual(qs);
		});

		it('should throw error if API request fails', async () => {
			const endpoint = '/dcim/devices/';
			const errorMessage = 'Network Error';
			(mockExecuteFunctions.helpers.request as jest.Mock).mockRejectedValueOnce(
				new Error(errorMessage),
			);

			await expect(client['apiRequest']('GET', endpoint)).rejects.toThrow(errorMessage);
		});
	});

	describe('getDevice', () => {
		const deviceId = 'test-device-id';
		const endpoint = `/dcim/devices/${deviceId}/`;

		it('should call apiRequest with correct parameters and return device data', async () => {
			const mockDeviceData = { id: deviceId, name: 'Test Device' };
			(mockExecuteFunctions.helpers.request as jest.Mock).mockResolvedValueOnce(
				mockDeviceData,
			);

			const result = await client.getDevice(deviceId);

			expect(mockExecuteFunctions.helpers.request).toHaveBeenCalledTimes(1);
			const requestOptions = (mockExecuteFunctions.helpers.request as jest.Mock)
				.mock.calls[0][0] as IHttpRequestOptions;
			expect(requestOptions.method).toBe('GET');
			expect(requestOptions.url).toBe(`${baseUrl}/api${endpoint}`);
			expect(result).toEqual(mockDeviceData);
		});

		it('should throw an error if the API call fails', async () => {
			const errorMessage = 'API Error: Device not found';
			(mockExecuteFunctions.helpers.request as jest.Mock).mockRejectedValueOnce(
				new Error(errorMessage),
			);

			await expect(client.getDevice(deviceId)).rejects.toThrow(errorMessage);
			expect(mockExecuteFunctions.helpers.request).toHaveBeenCalledTimes(1);
		});
	});

	describe('listDevices', () => {
		const endpoint = '/dcim/devices/';
		it('should call apiRequest with correct parameters and return list of devices', async () => {
			const mockDevicesData = [{ id: 'device1' }, { id: 'device2' }];
			(mockExecuteFunctions.helpers.request as jest.Mock).mockResolvedValueOnce(
				mockDevicesData,
			);
			const params = { site: 'ams01' };
			const result = await client.listDevices(params);

			expect(mockExecuteFunctions.helpers.request).toHaveBeenCalledTimes(1);
			const requestOptions = (mockExecuteFunctions.helpers.request as jest.Mock)
				.mock.calls[0][0] as IHttpRequestOptions;

			expect(requestOptions.method).toBe('GET');
			expect(requestOptions.url).toBe(`${baseUrl}/api${endpoint}`);
			expect(requestOptions.qs).toEqual(params);
			expect(result).toEqual(mockDevicesData);
		});

		it('should throw an error if the API call fails', async () => {
			const errorMessage = 'API Error: Unauthorized';
			(mockExecuteFunctions.helpers.request as jest.Mock).mockRejectedValueOnce(
				new Error(errorMessage),
			);

			await expect(client.listDevices()).rejects.toThrow(errorMessage);
			expect(mockExecuteFunctions.helpers.request).toHaveBeenCalledTimes(1);
		});
	});
});
