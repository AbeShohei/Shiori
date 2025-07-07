import React from 'react';
import { CreditCard, TrendingUp, TrendingDown } from 'lucide-react';

/**
 * 予算概要コンポーネントのプロパティ
 * 
 * @param totalBudget - 総予算
 * @param totalExpenses - 総支出
 * @param remainingBudget - 残り予算
 * @param expenses - 支出リスト
 * @param categoryBudgets - カテゴリ別予算リスト
 */
interface Expense {
  id: string;
  date: string;
  category: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
}

interface CategoryBudget {
  category: string;
  amount: number;
}

interface BudgetOverviewProps {
  totalBudget: number;
  totalExpenses: number;
  remainingBudget: number;
  expenses: Expense[];
  categoryBudgets: CategoryBudget[];
}

/**
 * 予算概要コンポーネント
 * 予算、支出、残り予算の概要を表示
 */
const BudgetOverview: React.FC<BudgetOverviewProps> = ({
  totalBudget,
  totalExpenses,
  remainingBudget,
  expenses = [],
  categoryBudgets = [],
}) => {
  // カテゴリごとの実支出額を集計
  const actuals: Record<string, number> = {};
  expenses.forEach(e => {
    if (e.type === 'expense') {
      actuals[e.category] = (actuals[e.category] || 0) + e.amount;
    }
  });

  return (
    <>
      {/* 全体予算・支出バー */}
      <div className="mb-8 bg-white p-6 rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">全体の予算と支出</h3>
        <div className="space-y-4">
          {/* 総予算バー */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="font-medium text-gray-700 dark:text-gray-300">総支出</span>
              <span className={`text-sm font-mono ${totalExpenses > totalBudget ? 'text-red-600 dark:text-red-400' : 'text-gray-700 dark:text-gray-300'}`}>¥{totalExpenses.toLocaleString()} / ¥{totalBudget.toLocaleString()}</span>
            </div>
            <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden relative">
              {/* 予算内 or 超過時のバー */}
              {totalExpenses > totalBudget ? (
                <div
                  className="h-4 rounded-full transition-all duration-300 bg-red-500"
                  style={{ width: `${80 + Math.min(((totalExpenses - totalBudget) / totalBudget) * 80, 20)}%` }}
                />
              ) : (
                <div
                  className="h-4 rounded-full transition-all duration-300 bg-blue-500"
                  style={{ width: `${Math.min((totalExpenses / totalBudget), 1) * 80}%` }}
                />
              )}
              {/* 予算の線（80%地点、バーの上に重ねて目立つ色） */}
              <div
                className="absolute top-0 bottom-0 w-1 bg-yellow-400 z-10 rounded"
                style={{ left: 'calc(80% - 2px)' }}
              />
            </div>
            {totalExpenses > totalBudget && (
              <div className="text-xs text-red-600 dark:text-red-400 mt-1">予算超過：+¥{(totalExpenses - totalBudget).toLocaleString()}</div>
            )}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 予算 */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">予算</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                ¥{totalBudget.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full dark:bg-blue-900">
              <CreditCard className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>
        
        {/* 支出 */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">支出</p>
              <p className="text-2xl font-semibold text-red-600 dark:text-red-400">
                ¥{totalExpenses.toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-full dark:bg-red-900">
              <TrendingDown className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
        </div>
        
        {/* 残り */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">残り</p>
              <p className={`text-2xl font-semibold ${remainingBudget >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                ¥{remainingBudget.toLocaleString()}
              </p>
            </div>
            <div className={`p-3 rounded-full ${remainingBudget >= 0 ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'}`}>
              <TrendingUp className={`h-6 w-6 ${remainingBudget >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`} />
            </div>
          </div>
        </div>
      </div>

      {/* カテゴリ別予算バー */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow-sm border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">AI推測カテゴリ別予算</h3>
        <div className="space-y-4">
          {categoryBudgets.map(({ category, amount }) => {
            const actual = actuals[category] || 0;
            const percent = Math.min((actual / amount), 1) * 80; // 予算内は最大80%
            const isOver = actual > amount;
            const overPercent = isOver ? Math.min(((actual - amount) / amount) * 80, 20) : 0;
            return (
              <div key={category}>
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium text-gray-700 dark:text-gray-300">{category}</span>
                  <span className={`text-sm font-mono ${isOver ? 'text-red-600 dark:text-red-400' : 'text-gray-700 dark:text-gray-300'}`}>¥{actual.toLocaleString()} / ¥{amount.toLocaleString()}</span>
                </div>
                <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden relative">
                  {isOver ? (
                    <div
                      className="h-4 rounded-full transition-all duration-300 bg-red-500"
                      style={{ width: `${80 + overPercent}%` }}
                    />
                  ) : (
                    <div
                      className="h-4 rounded-full transition-all duration-300 bg-blue-500"
                      style={{ width: `${percent}%` }}
                    />
                  )}
                  {/* 予算の線（80%地点、バーの上に重ねて目立つ色） */}
                  <div
                    className="absolute top-0 bottom-0 w-1 bg-yellow-400 z-20 rounded"
                    style={{ left: 'calc(80% - 2px)' }}
                  />
                </div>
                {isOver && (
                  <div className="text-xs text-red-600 dark:text-red-400 mt-1">予算超過：+¥{(actual - amount).toLocaleString()}</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default BudgetOverview; 