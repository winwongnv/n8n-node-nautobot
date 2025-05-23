import { IExecuteFunctions, INodeExecutionData, NodeApiError, NodeOperationError } from 'n8n-workflow';
import { Nautobot } from './Nautobot.node';
import { NautobotApiClient } from '../../services/NautobotApiClient';

// Mock NautobotApiClient
jest.mock('../../services/NautobotApiClient');

const MockedNautobotApiClient = NautobotApiClient as jest.MockedClass<typeof NautobotApiClient>;

describe('NautobotNode', () => {
	let executeFunctions: IExecuteFunctions;
	let node: Nautobot;

	beforeEach(() => {
		jest.clearAllMocks();

		// Mock IExecuteFunctions
		executeFunctions = {
			getCredentials: jest.fn().mockResolvedValue({
				apiUrl: 'http://localhost:8000',
				token: 'testToken',
			}),
			getNodeParameter: jest.fn(),
			helpers: {
				returnJsonArray: jest.fn((data) => [{ json: data } as INodeExecutionData]), // Simplified mock
			},
			getNode: jest.fn().mockReturnValue({
				// Mock basic node structure needed for errors
				getName: () => 'Nautobot Node',
				getExecutionId: () => 'exec-id-123',
				getContext: (key: string) => ({ itemIndex: key === 'itemIndex' ? 0 : undefined } as any),
			}),
			continueOnFail: jest.fn().mockReturnValue(false),
		} as unknown as IExecuteFunctions;

		node = new Nautobot();
	});

	describe('execute', () => {
		it("should call NautobotApiClient.getDevice and return data for 'getDevice' operation", async () => {
			const deviceId = 'device-id-123';
			const mockDeviceData = { id: deviceId, name: 'Test Device' };

			(executeFunctions.getNodeParameter as jest.Mock)
				.mockReturnValueOnce('getDevice') // operation
				.mockReturnValueOnce(deviceId); // deviceId

			const getDeviceMock = jest.fn().mockResolvedValue(mockDeviceData);
			MockedNautobotApiClient.prototype.getDevice = getDeviceMock;

			const result = await node.execute.call(executeFunctions);

			expect(executeFunctions.getCredentials).toHaveBeenCalledWith('nautobotApi');
			expect(MockedNautobotApiClient).toHaveBeenCalledWith(
				'http://localhost:8000',
				'testToken',
				executeFunctions,
			);
			expect(getDeviceMock).toHaveBeenCalledWith(deviceId);
			expect(executeFunctions.helpers.returnJsonArray).toHaveBeenCalledWith([mockDeviceData]);
			expect(result).toEqual([{ json: [mockDeviceData] }]);
		});

		it('should throw NodeOperationError if deviceId is not provided for getDevice operation', async () => {
			(executeFunctions.getNodeParameter as jest.Mock)
				.mockReturnValueOnce('getDevice') // operation
				.mockReturnValueOnce(undefined); // deviceId (missing)

			await expect(node.execute.call(executeFunctions)).rejects.toThrow(NodeOperationError);
			expect(MockedNautobotApiClient.prototype.getDevice).not.toHaveBeenCalled();
		});

		it('should throw NodeOperationError for an unsupported operation', async () => {
			(executeFunctions.getNodeParameter as jest.Mock).mockReturnValueOnce('unsupportedOperation');

			await expect(node.execute.call(executeFunctions)).rejects.toThrow(NodeOperationError);
			expect(MockedNautobotApiClient.prototype.getDevice).not.toHaveBeenCalled();
		});

		it('should throw NodeApiError if NautobotApiClient.getDevice throws an error', async () => {
			const deviceId = 'device-id-456';
			const apiErrorMessage = 'API Error: Device not found';

			(executeFunctions.getNodeParameter as jest.Mock)
				.mockReturnValueOnce('getDevice') // operation
				.mockReturnValueOnce(deviceId); // deviceId

			const getDeviceMock = jest.fn().mockRejectedValue(new Error(apiErrorMessage));
			MockedNautobotApiClient.prototype.getDevice = getDeviceMock;
			// Simulate AxiosError structure for more precise error handling in the node
			const axiosError = { isAxiosError: true, message: apiErrorMessage, response: { data: 'Not Found' } };
			MockedNautobotApiClient.prototype.getDevice = jest.fn().mockRejectedValue(axiosError);


			await expect(node.execute.call(executeFunctions)).rejects.toThrow(NodeApiError);
			try {
				await node.execute.call(executeFunctions);
			} catch (e: any) {
				expect(e).toBeInstanceOf(NodeApiError);
				expect(e.message).toContain(`Nautobot API request failed: ${apiErrorMessage}`);
			}

			expect(getDeviceMock).toHaveBeenCalledWith(deviceId);
		});

		it('should return empty array if API returns undefined or null', async () => {
			const deviceId = 'device-id-789';
			(executeFunctions.getNodeParameter as jest.Mock)
				.mockReturnValueOnce('getDevice')
				.mockReturnValueOnce(deviceId);

			MockedNautobotApiClient.prototype.getDevice = jest.fn().mockResolvedValue(null);
			const result = await node.execute.call(executeFunctions);
			expect(executeFunctions.helpers.returnJsonArray).toHaveBeenCalledWith([]);
			expect(result).toEqual([{ json: [] }]);

			MockedNautobotApiClient.prototype.getDevice = jest.fn().mockResolvedValue(undefined);
			const result2 = await node.execute.call(executeFunctions);
			expect(executeFunctions.helpers.returnJsonArray).toHaveBeenCalledWith([]);
			expect(result2).toEqual([{ json: [] }]);
		});

		it('should return error data if continueOnFail is true and API client throws error', async () => {
			const deviceId = 'device-id-error';
			const errorMessage = 'API Failure';
			(executeFunctions.getNodeParameter as jest.Mock)
				.mockReturnValueOnce('getDevice')
				.mockReturnValueOnce(deviceId);

			(executeFunctions.continueOnFail as jest.Mock).mockReturnValue(true);
			MockedNautobotApiClient.prototype.getDevice = jest.fn().mockRejectedValue(new Error(errorMessage));

			const result = await node.execute.call(executeFunctions);

			expect(executeFunctions.helpers.returnJsonArray).toHaveBeenCalledWith([{ error: errorMessage }]);
			expect(result).toEqual([{ json: [{ error: errorMessage }] }]);
		});

	});
});
