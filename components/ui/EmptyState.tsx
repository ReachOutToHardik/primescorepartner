import React from 'react';
import Link from 'next/link';
import { MagnifyingGlass, FileX, UserPlus, PlusCircle } from '@phosphor-icons/react';
import { Button } from '@/components/ui/Button';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  actionHref?: string;
  onActionClick?: () => void;
  icon?: 'search' | 'empty' | 'user';
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No Data Found',
  description = 'There are no records matching your current filter selection or search query.',
  actionText,
  actionHref,
  onActionClick,
  icon = 'empty',
}) => {
  const renderIcon = () => {
    switch (icon) {
      case 'search':
        return <MagnifyingGlass size={36} className="text-slate-400" />;
      case 'user':
        return <UserPlus size={36} className="text-[#1B2A72]" />;
      case 'empty':
      default:
        return <FileX size={36} className="text-slate-400" />;
    }
  };

  return (
    <div className="p-8 sm:p-12 text-center flex flex-col items-center justify-center space-y-4 max-w-md mx-auto">
      <div className="w-16 h-16 rounded-2xl bg-slate-100/80 border border-slate-200/80 flex items-center justify-center shadow-2xs">
        {renderIcon()}
      </div>

      <div className="space-y-1">
        <h3 className="font-display font-bold text-base text-slate-900">{title}</h3>
        <p className="text-xs text-slate-500 font-medium leading-relaxed">{description}</p>
      </div>

      {actionText && (
        <div className="pt-2">
          {actionHref ? (
            <Link href={actionHref}>
              <Button size="sm" variant="primary" leftIcon={<PlusCircle size={16} weight="bold" />}>
                {actionText}
              </Button>
            </Link>
          ) : (
            <Button size="sm" variant="primary" onClick={onActionClick} leftIcon={<PlusCircle size={16} weight="bold" />}>
              {actionText}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
