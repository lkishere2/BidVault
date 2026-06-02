import type { UserResponse } from '../../../../types/user';
import { UsernameChangingBox } from './UsernameChangingBox';
import { EmailChangingBox } from './EmailChangingBox';
import { ProfileImageChangingBox } from './ProfileImageChangingBox';
import { PasswordChangingBox } from './PasswordChangingBox';

export const SettingBox = ({ user }: { user: UserResponse }) => {
    return (
        <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">Security & Credentials</h2>
            <div className="flex flex-col">
                <ProfileImageChangingBox currentImage={user.profileImageUrl} />
                <UsernameChangingBox currentUsername={user.username} />
                <EmailChangingBox currentEmail={user.email} />
                <PasswordChangingBox />
            </div>
        </div>
    );
};