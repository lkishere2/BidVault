import type { UserResponse } from '../../../../types/user';

export const AccountInfo = ({ user }: { user: UserResponse }) => {
    return (
        <div className="p-6 bg-white border border-[#E8E8E8] rounded-lg">
            <h2 className="text-xl font-bold mb-4 text-[#0D0D0D]">Account Info</h2>
            <div className="flex items-center gap-4 mb-5">
                {user.profileImageUrl ? (
                    <img src={user.profileImageUrl} alt="Profile" className="w-16 h-16 rounded-full object-cover border border-[#E8E8E8]" />
                ) : (
                    <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold bg-[#F5C518] text-[#0D0D0D]">
                        {user.username.charAt(0).toUpperCase()}
                    </div>
                )}
                <div>
                    <p className="text-lg font-semibold text-[#0D0D0D]">{user.username}</p>
                    <p className="text-sm text-neutral-400">ID: #{user.id}</p>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm border-t border-[#E8E8E8] pt-4">
                <div>
                    <span className="font-semibold text-[#0D0D0D] block mb-0.5">Email</span>
                    <p className="text-neutral-500">{user.email}</p>
                </div>
                <div>
                    <span className="font-semibold text-[#0D0D0D] block mb-0.5">Balance</span>
                    <p className="text-[#b07d00] font-medium">${user.balance}</p>
                </div>
            </div>
        </div>
    );
};