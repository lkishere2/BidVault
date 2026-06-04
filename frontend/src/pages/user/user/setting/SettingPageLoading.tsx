// pages/user/user/settings/SettingPageLoading.tsx
export const AccountInfoLoading = () => (
    <div className="p-6 sm:p-8 bg-white border border-neutral-200 rounded-2xl shadow-sm animate-pulse">
        <div className="h-6 bg-neutral-200 rounded w-1/4 mb-5"></div>
        <div className="flex items-center gap-5 mb-6">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-neutral-200 border-2 border-neutral-100"></div>
            <div className="flex flex-col gap-2">
                <div className="h-5 bg-neutral-200 rounded w-32"></div>
                <div className="h-3 bg-neutral-100 rounded w-20"></div>
            </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-neutral-100 pt-5">
            <div>
                <div className="h-3 bg-neutral-100 rounded w-16 mb-2"></div>
                <div className="h-4 bg-neutral-200 rounded w-48"></div>
            </div>
            <div>
                <div className="h-3 bg-neutral-100 rounded w-16 mb-2"></div>
                <div className="h-4 bg-neutral-200 rounded w-24"></div>
            </div>
        </div>
    </div>
);

export const SettingBoxLoading = () => (
    <div className="space-y-4 animate-pulse mt-8">
        {[1, 2, 3, 4].map((i) => (
            <div key={i} className="p-4 bg-white border border-neutral-100 rounded-lg shadow-sm h-24"></div>
        ))}
    </div>
);

export const SettingPageLoading = () => (
    <div className="w-full bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="mb-6">
            <div className="h-8 bg-neutral-200 rounded w-1/3 mb-2 animate-pulse"></div>
            <div className="h-4 bg-neutral-100 rounded w-1/2 animate-pulse"></div>
        </div>
        <AccountInfoLoading />
        <SettingBoxLoading />
    </div>
);