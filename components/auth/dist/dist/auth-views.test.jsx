0, 0 @@
import React from "react"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import "@testing-library/jest-dom"

import { LoginView as SimpleLoginView } from "./login-view-new"
import { LoginView as ComplexLoginView } from "./login-view"
import { RegistrationView } from "./registration-view"
import { ForgotPasswordView } from "./forgot-password-view"
import { LogoutView } from "./logout-view"

// Mock Next.js Image component
jest.mock("next/image", () => ({
    __esModule: true,
    default: (props: any) => {
        // eslint-disable-next-line @next/next/no-img-element
        return <img {...props} />
    },
}))

// Mock DynamicBackground component
jest.mock("@/components/dynamic-background", () => ({
    DynamicBackground: () => <div data-testid="dynamic-background"></div>,
}))

// Mock localStorage
const localStorageMock = (() => {
    let store: { [key: string]: string } = {}
    return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => {
            store[key] = value.toString()
        },
        clear: () => {
            store = {}
        },
        removeItem: (key: string) => {
            delete store[key]
        },
    }
})()
Object.defineProperty(window, "localStorage", { value: localStorageMock })

// Mock fetch
global.fetch = jest.fn(() =>
    Promise.resolve({
        json: () => Promise.resolve({ success: true }),
        ok: true,
    })
) as jest.Mock

describe("Authentication Views", () => {
    beforeEach(() => {
        jest.clearAllMocks()
        localStorageMock.clear()

        // Mock window.matchMedia for theme detection in ComplexLoginView
        Object.defineProperty(window, "matchMedia", {
            writable: true,
            value: jest.fn().mockImplementation((query) => ({
                matches: false,
                media: query,
                onchange: null,
                addListener: jest.fn(), // deprecated
                removeListener: jest.fn(), // deprecated
                addEventListener: jest.fn(),
                removeEventListener: jest.fn(),
                dispatchEvent: jest.fn(),
            })),
        })

        // Mock window.location.reload
        const { location } = window
        // @ts-ignore
        delete window.location
        window.location = { ...location, reload: jest.fn() }
    })

    // =================================================================
    // SimpleLoginView Tests (from login-view-new.tsx)
    // =================================================================
    describe("SimpleLoginView (from login-view-new.tsx)", () => {
        const mockOnLogin = jest.fn()
        const mockOnSwitchToRegister = jest.fn()
        const mockOnSwitchToForgot = jest.fn()

        const renderLoginView = () =>
            render(
                <SimpleLoginView
                    onLogin={mockOnLogin}
                    onSwitchToRegister={mockOnSwitchToRegister}
                    onSwitchToForgot={mockOnSwitchToForgot}
                />
            )

        it("renders the login form correctly", () => {
            renderLoginView()
            expect(screen.getByLabelText("Tên đăng nhập")).toBeInTheDocument()
            expect(screen.getByLabelText("Mật khẩu")).toBeInTheDocument()
            expect(screen.getByRole("button", { name: "Đăng nhập" })).toBeInTheDocument()
            expect(screen.getByText("Demo Account:")).toBeInTheDocument()
        })

        it("updates username and password fields on user input", () => {
            renderLoginView()
            const usernameInput = screen.getByLabelText("Tên đăng nhập")
            const passwordInput = screen.getByLabelText("Mật khẩu")

            fireEvent.change(usernameInput, { target: { value: "testuser" } })
            fireEvent.change(passwordInput, { target: { value: "password123" } })

            expect(usernameInput).toHaveValue("testuser")
            expect(passwordInput).toHaveValue("password123")
        })

        it("calls onLogin with correct credentials on submit", async () => {
            mockOnLogin.mockResolvedValue({ success: true })
            renderLoginView()

            fireEvent.change(screen.getByLabelText("Tên đăng nhập"), { target: { value: "testuser" } })
            fireEvent.change(screen.getByLabelText("Mật khẩu"), { target: { value: "password123" } })
            fireEvent.click(screen.getByRole("button", { name: "Đăng nhập" }))

            expect(screen.getByText("Đang đăng nhập...")).toBeInTheDocument()
            await waitFor(() => expect(mockOnLogin).toHaveBeenCalledWith("testuser", "password123"))
        })

        it("displays an error message on failed login", async () => {
            mockOnLogin.mockResolvedValue({ success: false, message: "Sai thông tin" })
            renderLoginView()

            fireEvent.click(screen.getByRole("button", { name: "Đăng nhập" }))

            await waitFor(() => {
                expect(screen.getByText("Sai thông tin")).toBeInTheDocument()
            })
            expect(screen.queryByText("Đang đăng nhập...")).not.toBeInTheDocument()
        })

        it("calls onSwitchToRegister when 'Đăng ký ngay' is clicked", () => {
            renderLoginView()
            fireEvent.click(screen.getByText("Chưa có tài khoản? Đăng ký ngay"))
            expect(mockOnSwitchToRegister).toHaveBeenCalledTimes(1)
        })

        it("calls onSwitchToForgot when 'Quên mật khẩu?' is clicked", () => {
            renderLoginView()
            fireEvent.click(screen.getByText("Quên mật khẩu?"))
            expect(mockOnSwitchToForgot).toHaveBeenCalledTimes(1)
        })

        it("loads app settings from localStorage", () => {
            const settings = { appName: "My Test App", logoUrl: "/test-logo.png" }
            localStorageMock.setItem("appSettings_v2", JSON.stringify(settings))
            renderLoginView()
            expect(screen.getByText(settings.appName)).toBeInTheDocument()
            expect(screen.getByAltText(`${settings.appName} Logo`)).toHaveAttribute("src", settings.logoUrl)
        })
    })

    // =================================================================
    // ComplexLoginView Tests (from login-view.tsx)
    // =================================================================
    describe("ComplexLoginView (from login-view.tsx)", () => {
        const mockOnLogin = jest.fn()
        const mockOnSwitchToRegister = jest.fn()
        const mockOnSwitchToForgot = jest.fn()

        const renderComplexLoginView = () =>
            render(
                <ComplexLoginView
                    onLogin={mockOnLogin}
                    onSwitchToRegister={mockOnSwitchToRegister}
                    onSwitchToForgot={mockOnSwitchToForgot}
                />
            )

        beforeAll(() => {
            // Mock requestAnimationFrame for animations
            window.requestAnimationFrame = (callback) => {
                callback(0)
                return 1
            }
        })

        it("renders the complex login form with video background", () => {
            renderComplexLoginView()
            expect(screen.getByLabelText("Tên đăng nhập")).toBeInTheDocument()
            expect(screen.getByLabelText("Mật khẩu")).toBeInTheDocument()
            // Check for video element
            const video = document.querySelector("video")
            expect(video).toBeInTheDocument()
            expect(video).toHaveAttribute("playsInline")
        })

        it("recognizes user role and displays it on username input", async () => {
            renderComplexLoginView()
            const usernameInput = screen.getByLabelText("Tên đăng nhập")

            fireEvent.change(usernameInput, { target: { value: "adm_test" } })

            await waitFor(() => {
                expect(screen.getByText("✨ Người quản lý")).toBeInTheDocument()
            })

            // Also check for binary text
            expect(screen.getByText(/01100001 01100100 01101101/)).toBeInTheDocument()
        })

        it("cycles through greetings", async () => {
            jest.useFakeTimers()
            renderComplexLoginView()

            expect(screen.getByText("Xin chào")).toBeInTheDocument()

            // Fast-forward time to trigger the next greeting
            jest.advanceTimersByTime(3200) // 3000ms interval + 200ms fade

            await waitFor(() => {
                expect(screen.getByText("こんにちは")).toBeInTheDocument()
            })

            jest.useRealTimers()
        })

        it("handles reload button click", () => {
            renderComplexLoginView()
            const reloadButton = screen.getByRole("button", { name: "Reload" })
            fireEvent.click(reloadButton)
            expect(window.location.reload).toHaveBeenCalledTimes(1)
        })
    })

    // =================================================================
    // RegistrationView Tests
    // =================================================================
    describe("RegistrationView", () => {
        const mockOnSwitchToLogin = jest.fn()

        const renderRegistrationView = () => render(<RegistrationView onSwitchToLogin={mockOnSwitchToLogin} />)

        it("renders the registration form correctly", () => {
            renderRegistrationView()
            expect(screen.getByLabelText(/Tên đăng nhập/)).toBeInTheDocument()
            expect(screen.getByLabelText(/Email/)).toBeInTheDocument()
            expect(screen.getByLabelText(/Mật khẩu/)).toBeInTheDocument()
            expect(screen.getByLabelText(/Xác nhận mật khẩu/)).toBeInTheDocument()
            expect(screen.getByRole("button", { name: "Đăng ký" })).toBeInTheDocument()
        })

        it("shows an error if passwords do not match", async () => {
            renderRegistrationView()
            fireEvent.change(screen.getByLabelText(/Tên đăng nhập/), { target: { value: "newuser" } })
            fireEvent.change(screen.getByLabelText(/Email/), { target: { value: "new@test.com" } })
            fireEvent.change(screen.getByLabelText(/Mật khẩu/), { target: { value: "password123" } })
            fireEvent.change(screen.getByLabelText(/Xác nhận mật khẩu/), { target: { value: "password456" } })

            fireEvent.click(screen.getByRole("button", { name: "Đăng ký" }))

            await waitFor(() => {
                expect(screen.getByText("Mật khẩu xác nhận không khớp")).toBeInTheDocument()
            })
        })

        it("handles successful registration", async () => {
            jest.useFakeTimers()
                ; (global.fetch as jest.Mock).mockResolvedValueOnce({
                    ok: true,
                    json: () => Promise.resolve({ success: true, message: "Đăng ký thành công" }),
                })
            renderRegistrationView()

            fireEvent.change(screen.getByLabelText(/Tên đăng nhập/), { target: { value: "newuser" } })
            fireEvent.change(screen.getByLabelText(/Email/), { target: { value: "new@test.com" } })
            fireEvent.change(screen.getByLabelText(/Mật khẩu/), { target: { value: "password123" } })
            fireEvent.change(screen.getByLabelText(/Xác nhận mật khẩu/), { target: { value: "password123" } })

            fireEvent.click(screen.getByRole("button", { name: "Đăng ký" }))

            await waitFor(() => expect(screen.getByText("Đăng ký thành công!")).toBeInTheDocument())

            // Fast-forward timers
            jest.runAllTimers()
            await waitFor(() => expect(mockOnSwitchToLogin).toHaveBeenCalledTimes(1))
            jest.useRealTimers()
        })

        it("handles failed registration from API", async () => {
            ; (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: false,
                json: () => Promise.resolve({ success: false, message: "Tên đăng nhập đã tồn tại" }),
            })
            renderRegistrationView()

            fireEvent.change(screen.getByLabelText(/Tên đăng nhập/), { target: { value: "newuser" } })
            fireEvent.change(screen.getByLabelText(/Email/), { target: { value: "new@test.com" } })
            fireEvent.change(screen.getByLabelText(/Mật khẩu/), { target: { value: "password123" } })
            fireEvent.change(screen.getByLabelText(/Xác nhận mật khẩu/), { target: { value: "password123" } })

            fireEvent.click(screen.getByRole("button", { name: "Đăng ký" }))

            await waitFor(() => expect(screen.getByText("Tên đăng nhập đã tồn tại")).toBeInTheDocument())
        })
    })

    // =================================================================
    // ForgotPasswordView Tests
    // =================================================================
    describe("ForgotPasswordView", () => {
        const mockOnBackToLogin = jest.fn()

        const renderForgotPasswordView = () => render(<ForgotPasswordView onBackToLogin={mockOnBackToLogin} />)

        it("renders the forgot password form correctly", () => {
            renderForgotPasswordView()
            expect(screen.getByLabelText("Email")).toBeInTheDocument()
            expect(screen.getByRole("button", { name: "Gửi email đặt lại" })).toBeInTheDocument()
        })

        it("shows success message after sending email", async () => {
            ; (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ success: true, message: "Kiểm tra email của bạn." }),
            })
            renderForgotPasswordView()

            fireEvent.change(screen.getByLabelText("Email"), { target: { value: "forgot@test.com" } })
            fireEvent.click(screen.getByRole("button", { name: "Gửi email đặt lại" }))

            await waitFor(() => expect(screen.getByText("Email đã được gửi!")).toBeInTheDocument())
            expect(screen.getByText("Kiểm tra email của bạn.")).toBeInTheDocument()
        })

        it("shows error message on failure", async () => {
            ; (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: false,
                json: () => Promise.resolve({ success: false, message: "Email không tồn tại." }),
            })
            renderForgotPasswordView()

            fireEvent.change(screen.getByLabelText("Email"), { target: { value: "forgot@test.com" } })
            fireEvent.click(screen.getByRole("button", { name: "Gửi email đặt lại" }))

            await waitFor(() => expect(screen.getByText("Email không tồn tại.")).toBeInTheDocument())
        })

        it("calls onBackToLogin when 'Quay lại đăng nhập' is clicked", () => {
            renderForgotPasswordView()
            fireEvent.click(screen.getByRole("button", { name: /Quay lại đăng nhập/ }))
            expect(mockOnBackToLogin).toHaveBeenCalledTimes(1)
        })
    })

    // =================================================================
    // LogoutView Tests
    // =================================================================
    describe("LogoutView", () => {
        const mockOnLogout = jest.fn()
        const mockOnCancel = jest.fn()

        const renderLogoutView = () =>
            render(
                <LogoutView
                    onLogout={mockOnLogout}
                    onCancel={mockOnCancel}
                    userName="Test User"
                    userRole="Admin"
                />
            )

        it("renders correctly with user information", () => {
            renderLogoutView()
            expect(screen.getByText(/Admin Test User/)).toBeInTheDocument()
            expect(screen.getByText("Bạn có chắc chắn muốn đăng xuất khỏi AKs Studio?")).toBeInTheDocument()
            expect(screen.getByRole("button", { name: "Đăng xuất" })).toBeInTheDocument()
            expect(screen.getByRole("button", { name: "Hủy bỏ" })).toBeInTheDocument()
        })

        it("calls onLogout when the logout button is clicked", async () => {
            mockOnLogout.mockResolvedValue({ success: true })
            renderLogoutView()

            fireEvent.click(screen.getByRole("button", { name: "Đăng xuất" }))

            expect(screen.getByText("Đang đăng xuất...")).toBeInTheDocument()
            await waitFor(() => expect(mockOnLogout).toHaveBeenCalledTimes(1))
        })

        it("displays an error message on failed logout", async () => {
            mockOnLogout.mockResolvedValue({ success: false, message: "Lỗi đăng xuất" })
            renderLogoutView()

            fireEvent.click(screen.getByRole("button", { name: "Đăng xuất" }))

            await waitFor(() => {
                expect(screen.getByText("Lỗi đăng xuất")).toBeInTheDocument()
            })
        })

        it("calls onCancel when the cancel button is clicked", () => {
            renderLogoutView()
            fireEvent.click(screen.getByRole("button", { name: "Hủy bỏ" }))
            expect(mockOnCancel).toHaveBeenCalledTimes(1)
        })

        it("cycles through farewell messages", async () => {
            jest.useFakeTimers()
            renderLogoutView()

            // Initial farewell
            expect(screen.getByText("Tạm biệt")).toBeInTheDocument()

            // Fast-forward time
            jest.advanceTimersByTime(3200) // 3000ms interval + 200ms fade

            await waitFor(() => {
                expect(screen.getByText("Au revoir")).toBeInTheDocument()
            })

            jest.useRealTimers()
        })
    })
})