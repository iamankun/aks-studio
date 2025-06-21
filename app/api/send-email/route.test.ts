import { POST } from './route';
import nodemailer from 'nodemailer';

// Mock the nodemailer library
jest.mock('nodemailer', () => ({
    createTransport: jest.fn(() => ({
        sendMail: jest.fn(),
    })),
}));

// Mock the NextResponse object
jest.mock('next/server', () => ({
    NextResponse: {
        json: jest.fn((body, options) => ({ body, options })),
    },
}));

const mockSendMail = nodemailer.createTransport().sendMail as jest.Mock;
const mockNextResponseJson = (require('next/server') as any).NextResponse.json as jest.Mock;

describe('Email API Route', () => {
    const defaultEmailDetails = {
        to: 'recipient@example.com',
        subject: 'Test Subject',
        textBody: 'This is a test email body.',
    };

    const mockRequest = (body: any) => ({
        json: jest.fn().mockResolvedValue(body),
    } as any);

    beforeEach(() => {
        // Clear mocks before each test
        mockSendMail.mockClear();
        mockNextResponseJson.mockClear();
        // Reset environment variables
        jest.resetModules();
        process.env = {
            ...process.env,
            SMTP_HOST: 'smtp.mail.me.com',
            SMTP_PORT: '587',
            SMTP_USER: 'admin@ankun.dev',
            SMTP_PASS: 'grsa-aaxz-midn-pjta',
            SMTP_FROM: 'ankunstudio@ankun.dev',
        };
    });

    afterEach(() => {
        // Clean up environment variables mock
        delete process.env.SMTP_HOST;
        delete process.env.SMTP_PORT;
        delete process.env.SMTP_USER;
        delete process.env.SMTP_PASS;
        delete process.env.SMTP_FROM;
    });

    it('should send email successfully with default sender', async () => {
        const request = mockRequest(defaultEmailDetails);

        await POST(request);

        expect(nodemailer.createTransport).toHaveBeenCalledWith({
            host: 'smtp.mail.me.com',
            port: 587,
            secure: false, // 587 is not secure by default
            auth: {
                user: 'admin@ankun.dev',
                pass: 'grsa-aaxz-midn-pjta',
            },
        });
        expect(mockSendMail).toHaveBeenCalledWith({
            from: 'ankunstudio@ankun.dev', // Default sender
            to: defaultEmailDetails.to,
            cc: undefined,
            bcc: undefined,
            subject: defaultEmailDetails.subject,
            text: defaultEmailDetails.textBody,
            html: undefined,
        });
        expect(mockNextResponseJson).toHaveBeenCalledWith(
            { success: true, message: `Email đã được gửi thành công đến ${defaultEmailDetails.to}.` },
            undefined // Default options for json()
        );
    });

    it('should send email successfully with custom sender', async () => {
        const customEmailDetails = {
            ...defaultEmailDetails,
            from: 'custom@example.com',
            htmlBody: '<p>HTML body</p>',
            cc: 'cc@example.com',
            bcc: 'bcc@example.com',
        };
        const request = mockRequest(customEmailDetails);

        await POST(request);

        expect(mockSendMail).toHaveBeenCalledWith({
            from: customEmailDetails.from, // Custom sender
            to: customEmailDetails.to,
            cc: customEmailDetails.cc,
            bcc: customEmailDetails.bcc,
            subject: customEmailDetails.subject,
            text: customEmailDetails.textBody,
            html: customEmailDetails.htmlBody,
        });
        expect(mockNextResponseJson).toHaveBeenCalledWith(
            { success: true, message: `Email đã được gửi thành công đến ${customEmailDetails.to}.` },
            undefined
        );
    });

    it('should return 400 if required fields are missing (to)', async () => {
        const invalidDetails = {
            subject: 'Test Subject',
            textBody: 'Body',
        };
        const request = mockRequest(invalidDetails);

        await POST(request);

        expect(mockSendMail).not.toHaveBeenCalled();
        expect(mockNextResponseJson).toHaveBeenCalledWith(
            { success: false, message: 'Thiếu thông tin email bắt buộc.' },
            { status: 400 }
        );
    });

    it('should return 400 if required fields are missing (subject)', async () => {
        const invalidDetails = {
            to: 'recipient@example.com',
            textBody: 'Body',
        };
        const request = mockRequest(invalidDetails);

        await POST(request);

        expect(mockSendMail).not.toHaveBeenCalled();
        expect(mockNextResponseJson).toHaveBeenCalledWith(
            { success: false, message: 'Thiếu thông tin email bắt buộc.' },
            { status: 400 }
        );
    });

    it('should return 400 if required fields are missing (textBody and htmlBody)', async () => {
        const invalidDetails = {
            to: 'recipient@example.com',
            subject: 'Test Subject',
        };
        const request = mockRequest(invalidDetails);

        await POST(request);

        expect(mockSendMail).not.toHaveBeenCalled();
        expect(mockNextResponseJson).toHaveBeenCalledWith(
            { success: false, message: 'Thiếu thông tin email bắt buộc.' },
            { status: 400 }
        );
    });

    it('should return 500 if sending email fails', async () => {
        const sendError = new Error('SMTP connection failed');
        mockSendMail.mockRejectedValueOnce(sendError);

        const request = mockRequest(defaultEmailDetails);

        await POST(request);

        expect(mockSendMail).toHaveBeenCalled(); // Should attempt to send
        expect(mockNextResponseJson).toHaveBeenCalledWith(
            { success: false, message: 'Lỗi gửi email từ server.', error: sendError.message },
            { status: 500 }
        );
    });

    it('should use SMTP_PORT 465 and secure: true if SMTP_PORT is 465', async () => {
        process.env.SMTP_PORT = '465';
        const request = mockRequest(defaultEmailDetails);

        await POST(request);

        expect(nodemailer.createTransport).toHaveBeenCalledWith({
            host: 'smtp.mail.me.com',
            port: 465,
            secure: true, // Should be true for port 465
            auth: {
                user: 'admin@ankun.dev',
                pass: 'grsa-aaxz-midn-pjta',
            },
        });
        expect(mockSendMail).toHaveBeenCalled();
        expect(mockNextResponseJson).toHaveBeenCalledWith(
            { success: true, message: `Email đã được gửi thành công đến ${defaultEmailDetails.to}.` },
            undefined
        );
    });
});
