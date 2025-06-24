// Tôi là An Kun
import { sendEmail, type EmailDetails } from '@/lib/email'; // Adjust path as needed

// Mocking window.fetch
global.fetch = jest.fn();

describe('sendEmail', () => {
  const mockSuccessResponse = { success: true, message: 'Email sent successfully.' };
  const mockFailureResponse = { success: false, message: 'Server failed to send email.' };
  const mockApiErrorResponse = { success: false, message: 'Lỗi gửi email từ server.', error: 'Some server error' };

  beforeEach(() => {
    // Reset the mock before each test
    (global.fetch as jest.Mock).mockClear();
    jest.spyOn(console, 'error').mockImplementation(() => {}); // Suppress console.error during tests
  });

  afterEach(() => {
    (console.error as jest.Mock).mockRestore();
  });

  const validEmailDetails: EmailDetails = {
    to: 'test@example.com',
    from: 'sender@example.com',
    subject: 'Test Subject',
    textBody: 'This is a test email.',
  };

  it('should return success: false if "to" field is missing', async () => {
    const details = { ...validEmailDetails, to: '' } as EmailDetails;
    const result = await sendEmail(details);
    expect(result.success).toBe(false);
    expect(result.message).toBe('Thông tin email chưa đầy đủ.');
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('should return success: false if "subject" field is missing', async () => {
    const details = { ...validEmailDetails, subject: '' } as EmailDetails;
    const result = await sendEmail(details);
    expect(result.success).toBe(false);
    expect(result.message).toBe('Thông tin email chưa đầy đủ.');
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('should return success: false if both "textBody" and "htmlBody" are missing', async () => {
    const details = { ...validEmailDetails, textBody: '', htmlBody: undefined } as EmailDetails;
    const result = await sendEmail(details);
    expect(result.success).toBe(false);
    expect(result.message).toBe('Thông tin email chưa đầy đủ.');
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('should call fetch with correct parameters and return success on API success', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockSuccessResponse,
    });

    const result = await sendEmail(validEmailDetails);

    expect(global.fetch).toHaveBeenCalledWith('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validEmailDetails),
    });
    expect(result).toEqual(mockSuccessResponse);
  });

  it('should work if only htmlBody is provided', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockSuccessResponse,
    });
    const detailsWithHtml: EmailDetails = {
      ...validEmailDetails,
      textBody: '', // textBody is empty
      htmlBody: '<p>This is a test email.</p>',
    };
    const result = await sendEmail(detailsWithHtml);
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(result.success).toBe(true);
  });


  it('should return API failure response if API call is not successful', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true, // fetch itself was ok, but API logic failed
      json: async () => mockFailureResponse,
    });

    const result = await sendEmail(validEmailDetails);
    expect(result).toEqual(mockFailureResponse);
  });
  
  it('should return API error response if API returns an error structure', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockApiErrorResponse,
    });

    const result = await sendEmail(validEmailDetails);
    expect(result).toEqual(mockApiErrorResponse);
  });


  it('should handle network errors during fetch', async () => {
    const networkError = new Error('Network failed');
    (global.fetch as jest.Mock).mockRejectedValueOnce(networkError);

    const result = await sendEmail(validEmailDetails);

    expect(result.success).toBe(false);
    expect(result.message).toBe('Lỗi kết nối đến API gửi email.');
    expect(result.error).toBe(networkError.message);
    expect(console.error).toHaveBeenCalledWith("Client Error calling send-email API:", networkError);
  });

  it('should handle non-JSON responses from fetch (though response.json() handles this)', async () => {
    const jsonParseError = new SyntaxError('Unexpected token < in JSON at position 0');
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => { throw jsonParseError; },
    });

    const result = await sendEmail(validEmailDetails);
    // This scenario is tricky because the catch block in sendEmail would catch the error from response.json()
    // and wrap it. The exact message depends on how the fetch mock for .json() is set up.
    // If .json() itself throws, it's caught by the main catch block.
    expect(result.success).toBe(false);
    expect(result.message).toBe('Lỗi kết nối đến API gửi email.'); // This is the generic catch
    expect(result.error).toBe(jsonParseError.message);
    expect(console.error).toHaveBeenCalledWith("Client Error calling send-email API:", jsonParseError);
  });
});
