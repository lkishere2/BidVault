// pages/user/user/settings/SettingPageLoading.tsx
export const AccountInfoLoading = () => (
    <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-100 animate-pulse mb-6">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        </div>
    </div>
);

export const SettingBoxLoading = () => (
    <div className="space-y-4 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-4 bg-white border border-gray-100 rounded-lg shadow-sm h-24"></div>
        ))}
    </div>
);

export const SettingPageLoading = () => (
    <div className="max-w-3xl mx-auto p-4">
        <div className="h-8 bg-gray-200 rounded w-1/3 mb-2 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-6 animate-pulse"></div>
        <AccountInfoLoading />
        <SettingBoxLoading />
    </div>
);