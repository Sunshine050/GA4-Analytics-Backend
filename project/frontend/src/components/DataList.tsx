interface DataListProps {
  title: string;
  items: { name: string; value: number }[];
}

export default function DataList({ title, items }: DataListProps) {
  const maxValue = Math.max(...items.map(item => item.value), 1);

  const getIcon = (name: string) => {
    const lowerName = name.toLowerCase();

    if (lowerName.includes('instagram')) return '📷';
    if (lowerName.includes('facebook')) return '👥';
    if (lowerName.includes('opt.to') || lowerName.includes('link')) return '🔗';
    if (lowerName.includes('openlink')) return '🔗';

    if (lowerName === 'mobile') return '📱';
    if (lowerName === 'desktop') return '🖥️';
    if (lowerName === 'tablet') return '📱';

    if (lowerName.includes('thailand')) return '🇹🇭';
    if (lowerName.includes('united states') || lowerName.includes('usa')) return '🇺🇸';

    if (name.startsWith('/')) return '📄';

    return '🌐';
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
      <h3 className="text-lg font-medium text-neutral-100 mb-4">{title}</h3>
      <div className="space-y-3">
        {items.length === 0 ? (
          <div className="text-neutral-500 text-center py-4">No data available</div>
        ) : (
          items.map((item, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="text-base">{getIcon(item.name)}</span>
                  <span className="text-neutral-300 truncate">{item.name}</span>
                </div>
                <span className="text-neutral-100 font-medium ml-4">{item.value}</span>
              </div>
              <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${(item.value / maxValue) * 100}%` }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
