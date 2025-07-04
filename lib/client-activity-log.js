/**
 * Client utility để ghi log hoạt động người dùng
 */

/**
 * Ghi log hoạt động người dùng
 * @param {Object} params - Các tham số
 * @param {string} params.action - Loại hành động (required)
 * @param {string} [params.description] - Mô tả hành động
 * @param {string} [params.entityType] - Loại đối tượng tương tác
 * @param {string} [params.entityId] - ID của đối tượng tương tác
 * @param {string} [params.status="success"] - Trạng thái
 * @param {string} [params.result] - Kết quả
 * @param {Object} [params.details={}] - Chi tiết bổ sung
 * @returns {Promise<{success: boolean, id?: string, error?: string}>} Kết quả
 */
export async function logActivity({
    action,
    description,
    entityType,
    entityId,
    status = "success",
    result,
    details = {}
}) {
    try {
        // Validate input
        if (!action) {
            console.error("Activity log: Missing required 'action' parameter");
            return { success: false, error: "Missing required 'action' parameter" };
        }

        // Thêm thông tin thời gian
        const enhancedDetails = {
            ...details,
            clientTimestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href,
            path: window.location.pathname
        };

        // Gọi API
        const response = await fetch("/api/activity-log", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                action,
                description,
                entityType,
                entityId,
                status,
                result,
                details: enhancedDetails
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Activity log failed:", errorData.error);
            return { success: false, error: errorData.error };
        }

        const data = await response.json();
        return { success: true, id: data.id };
    } catch (error) {
        console.error("Activity log error:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Ghi log khi người dùng xem trang
 * @param {string} pageName - Tên trang
 * @param {Object} [details={}] - Thông tin bổ sung
 */
export function logPageView(pageName, details = {}) {
    return logActivity({
        action: "page_view",
        description: `Xem trang ${pageName}`,
        entityType: "page",
        entityId: pageName,
        details
    });
}

/**
 * Ghi log khi người dùng tương tác với UI (nút, form, etc)
 * @param {string} elementType - Loại phần tử (button, form, link, etc)
 * @param {string} elementName - Tên phần tử
 * @param {Object} [details={}] - Thông tin bổ sung
 */
export function logUIInteraction(elementType, elementName, details = {}) {
    return logActivity({
        action: "ui_interaction",
        description: `Tương tác với ${elementType}: ${elementName}`,
        entityType: elementType,
        entityId: elementName,
        details
    });
}

/**
 * Ghi log khi có lỗi xảy ra ở client
 * @param {string} errorType - Loại lỗi
 * @param {string} errorMessage - Thông báo lỗi
 * @param {Object} [details={}] - Thông tin bổ sung
 */
export function logClientError(errorType, errorMessage, details = {}) {
    return logActivity({
        action: "client_error",
        description: `Lỗi ${errorType}: ${errorMessage}`,
        entityType: "error",
        entityId: errorType,
        status: "error",
        result: "failed",
        details: {
            errorMessage,
            ...details
        }
    });
}

/**
 * Ghi log hoạt động đăng nhập
 * @param {string} method - Phương thức đăng nhập (password, google, github, etc)
 * @param {string} status - Trạng thái (success, failed)
 * @param {Object} [details={}] - Thông tin bổ sung
 */
export function logLogin(method, status, details = {}) {
    return logActivity({
        action: "login",
        description: `Đăng nhập bằng ${method}`,
        entityType: "auth",
        status,
        result: status === "success" ? "authenticated" : "failed",
        details: {
            method,
            ...details
        }
    });
}

/**
 * Ghi log hoạt động đăng ký
 * @param {string} method - Phương thức đăng ký (password, google, github, etc)
 * @param {string} status - Trạng thái (success, failed)
 * @param {Object} [details={}] - Thông tin bổ sung
 */
export function logRegistration(method, status, details = {}) {
    return logActivity({
        action: "registration",
        description: `Đăng ký bằng ${method}`,
        entityType: "auth",
        status,
        result: status === "success" ? "registered" : "failed",
        details: {
            method,
            ...details
        }
    });
}

/**
 * Ghi log hoạt động đăng xuất
 */
export function logLogout() {
    return logActivity({
        action: "logout",
        description: "Đăng xuất",
        entityType: "auth",
        status: "success",
        result: "logged_out"
    });
}

/**
 * Ghi log hoạt động submission
 * @param {string} action - Loại hành động (create, update, delete, approve, reject)
 * @param {string} submissionId - ID của submission
 * @param {string} status - Trạng thái (success, failed)
 * @param {Object} [details={}] - Thông tin bổ sung
 */
export function logSubmissionActivity(action, submissionId, status, details = {}) {
    return logActivity({
        action: `submission_${action}`,
        description: `${action} submission ${submissionId}`,
        entityType: "submission",
        entityId: submissionId,
        status,
        details
    });
}
