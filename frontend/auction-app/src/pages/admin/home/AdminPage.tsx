export default function AdminPage() {
    return (
        <div className="flex flex-col gap-4">
            <div>
                <h1 className="text-2xl font-bold text-[#0D0D0D] tracking-[-0.02em]">Welcome, Administrator</h1>
                <p className="text-neutral-500 text-sm mt-1">
                    Manage users, active marketplace auctions, and configure global platform security rules.
                </p>
            </div>
            <hr className="border-neutral-100 my-2" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
                <div className="border border-neutral-200 p-4 rounded-xl bg-neutral-50">
                    <h3 className="text-sm font-semibold text-neutral-500">Total Users</h3>
                    <p className="text-2xl font-bold text-[#0D0D0D] mt-1">--</p>
                </div>
                <div className="border border-neutral-200 p-4 rounded-xl bg-neutral-50">
                    <h3 className="text-sm font-semibold text-neutral-500">Live Auctions</h3>
                    <p className="text-2xl font-bold text-[#0D0D0D] mt-1">--</p>
                </div>
                <div className="border border-neutral-200 p-4 rounded-xl bg-neutral-50">
                    <h3 className="text-sm font-semibold text-neutral-500">Platform Volume</h3>
                    <p className="text-2xl font-bold text-[#0D0D0D] mt-1">$0.00</p>
                </div>
            </div>
        </div>
    );
}