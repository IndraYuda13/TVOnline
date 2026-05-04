'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

interface PlayableToggleProps {
  playableCount: number;
}

export default function PlayableToggle({ playableCount }: PlayableToggleProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const enabled = searchParams.get('playable') !== '0';

  function handleToggle(nextValue: boolean) {
    const params = new URLSearchParams(searchParams);

    if (nextValue) {
      params.delete('playable');
    } else {
      params.set('playable', '0');
    }

    replace(params.toString() ? `${pathname}?${params.toString()}` : pathname);
  }

  return (
    <label className="flex min-h-10 cursor-pointer items-center justify-between rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white">
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={enabled}
          disabled={playableCount === 0}
          onChange={(e) => handleToggle(e.target.checked)}
          className="h-4 w-4 rounded border-gray-600 bg-gray-900 text-blue-500"
        />
        <span>Playable only</span>
      </div>

      <span className="text-xs text-gray-400">{playableCount} verified</span>
    </label>
  );
}
