import { useState, useEffect } from 'react';
import { userApi } from '../../../../api/userApi';
import type { UserResponse } from '../../../../types/user';
import { AccountInfo } from './AccountInfo';
import { SettingBox } from './SettingBox';
import { SettingPageLoading } from './SettingPageLoading';

export default function SettingPage() {
    const [userData, setUserData] = useState<UserResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchUserData = async () => {
        try {
            const response = await userApi.getInfo();
            setUserData(response.data);
            setError(null);
        } catch (err) {
            setError('Failed to load user settings. Please try again.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchUserData();
    }, []);

    const handleRetry = () => {
        setIsLoading(true);
        fetchUserData();
    };

    if (isLoading) return <SettingPageLoading />;

    if (error) return (
        <div className="p-4 text-red-600 bg-red-50 rounded">
            {error}
            <button onClick={handleRetry} className="underline ml-2">Retry</button>
        </div>
    );

    if (!userData) return null;

    return (
        <div className="w-full bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8 shadow-sm">
            <div className="mb-6">
                <h1 className="text-2xl font-bold">Settings</h1>
                <p className="text-neutral-500 text-sm">Update security parameters and preference rules.</p>
            </div>

            <AccountInfo user={userData} />
            <div className="mt-8">
                <SettingBox user={userData} />
            </div>
        </div>
    );
}