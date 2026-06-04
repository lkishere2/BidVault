import type { UserResponse } from '../../../../types/user';

export const AccountInfo = ({ user }: { user: UserResponse }) => {
    return (
        <div className="p-6 sm:p-8 bg-white border border-neutral-200 rounded-2xl shadow-sm">
            <h2 className="text-[20px] font-black tracking-tight mb-5 text-[#0D0D0D]">Account Info</h2>
            <div className="flex items-center gap-5 mb-6">
                {user.profileImageUrl ? (
                    <img src={user.profileImageUrl} alt="Profile" className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-neutral-100 shadow-sm" />
                ) : (
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center text-[22px] font-black bg-[#F5C518] text-[#0D0D0D] shadow-sm">
                        {user.username.charAt(0).toUpperCase()}
                    </div>
                )}
                <div className="flex flex-col gap-0.5">
                    <p className="text-[18px] sm:text-[20px] font-black text-[#0D0D0D] tracking-tight">{user.username}</p>
                    <p className="text-[13px] font-bold text-neutral-400">ID: #{user.id}</p>
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm border-t border-neutral-100 pt-5">
                <div>
                    <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">Email</span>
                    <p className="text-[14px] font-semibold text-[#0D0D0D]">{user.email}</p>
                </div>
                <div>
                    <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">Balance</span>
                    <p className="text-[15px] font-black text-[#F5C518]">${user.balance}</p>
                </div>
            </div>
        </div>
    );
};