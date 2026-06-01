import type { UserResponse } from '../../../../types/user';
import { theme } from '../../../../components/constants/theme';

export const AccountInfo = ({ user }: { user: UserResponse }) => {
    return (
        <div className="p-6 bg-white border border-[#E8E8E8] rounded-lg shadow-sm">
            <h2 className="text-xl font-bold mb-4" style={{ color: theme.black }}>Current Account Info</h2>
            <div className="flex items-center gap-4 mb-4">
                {user.profileImageUrl ? (
                    <img src={user.profileImageUrl} alt="Profile" className="w-16 h-16 rounded-full object-cover border" />
                ) : (
                    <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold" style={{ backgroundColor: theme.gold, color: theme.black }}>
                        {user.username.charAt(0).toUpperCase()}
                    </div>
                )}
                <div>
                    <p className="text-lg font-semibold" style={{ color: theme.black }}>{user.username}</p>
                    <p className="text-sm" style={{ color: '#888' }}>ID: #{user.id}</p>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                    <span className="font-semibold" style={{ color: theme.black }}>Email:</span>
                    <p style={{ color: '#6b7280' }}>{user.email}</p>
                </div>
                <div>
                    <span className="font-semibold" style={{ color: theme.black }}>Balance:</span>
                    <p style={{ color: theme.goldDark }}>${user.balance}</p>
                </div>
            </div>
        </div>
    );
};