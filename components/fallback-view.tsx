"use client"

export default function FallbackView() {
    // Cố gắng hiển thị giao diện tối thiểu
    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold mb-6">DMG - Fallback Mode</h1>
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 mb-8">
                    <h2 className="text-2xl font-semibold mb-4">Debugging Mode Active</h2>
                    <p className="text-gray-300 mb-4">
                        This is a fallback view to diagnose rendering issues. If you see this page, it means
                        the application is having trouble rendering the main view.
                    </p>

                    <div className="bg-gray-900 p-4 rounded-md mb-6">
                        <h3 className="text-xl text-yellow-400 mb-2">Troubleshooting Steps:</h3>
                        <ol className="list-decimal pl-6 space-y-2 text-gray-300">
                            <li>Check the browser console for JavaScript errors</li>
                            <li>Clear browser cache and cookies</li>
                            <li>Clear localStorage by clicking the button below</li>
                            <li>Verify that all required API endpoints are responding</li>
                        </ol>
                    </div>

                    <div className="flex space-x-4">
                        <button
                            onClick={() => {
                                try {
                                    localStorage.clear();
                                    alert("LocalStorage cleared successfully. The page will now reload.");
                                    window.location.href = "/";
                                } catch (e) {
                                    alert(`Error clearing localStorage: ${e}`);
                                }
                            }}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
                        >
                            Clear LocalStorage
                        </button>

                        <button
                            onClick={() => {
                                window.location.reload();
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                        >
                            Reload Page
                        </button>
                    </div>
                </div>

                <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
                    <h2 className="text-2xl font-semibold mb-4">Debug Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-900 p-3 rounded-md">
                            <h3 className="text-yellow-400 text-lg mb-2">Browser Info</h3>
                            <p className="text-gray-300">{navigator.userAgent}</p>
                        </div>
                        <div className="bg-gray-900 p-3 rounded-md">
                            <h3 className="text-yellow-400 text-lg mb-2">Screen Size</h3>
                            <p className="text-gray-300">{window.innerWidth} x {window.innerHeight}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
