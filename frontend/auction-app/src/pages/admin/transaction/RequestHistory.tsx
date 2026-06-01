import RequestItem from './RequestItem';
import type { ClientRequest } from '../../../types/transaction';

interface RequestHistoryProps {
    requests: ClientRequest[];
    onRefresh: () => Promise<void>;
}

export default function RequestHistory({ requests, onRefresh }: RequestHistoryProps) {
    if (requests.length === 0) {
        return (
            <div className="border border-dashed border-neutral-200 rounded-xl p-12 text-center bg-neutral-50/30">
                <p className="text-sm font-medium text-neutral-400">No pending transaction requests found.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-3">
            {requests.map((request) => (
                <RequestItem
                    key={request.transactionId}
                    request={request}
                    onRefresh={onRefresh}
                />
            ))}
        </div>
    );
}