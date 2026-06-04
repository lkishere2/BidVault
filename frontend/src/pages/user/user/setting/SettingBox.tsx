import type { UserResponse } from '../../../../types/user';
import { UsernameChangingBox } from './UsernameChangingBox';
import { ProfileImageChangingBox } from './ProfileImageChangingBox';
import { PasswordChangingBox } from './PasswordChangingBox';

export const SettingBox = ({ user }: { user: UserResponse }) => {
    return (
        <div className="mt-10">
            <h2 className="text-[20px] font-black tracking-tight mb-6 text-[#0D0D0D]">Security & Credentials</h2>
            <div className="flex flex-col gap-5">
                <ProfileImageChangingBox currentImage={user.profileImageUrl} />
                <UsernameChangingBox currentUsername={user.username} />
                <PasswordChangingBox userEmail={user.email} />
            </div>
        </div>
    );
};