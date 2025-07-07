import React, { useState, useEffect } from 'react';
import { Plus, Settings, Edit, Save, X } from 'lucide-react';
import BudgetOverview from './BudgetOverview';
import ExpenseItem from './ExpenseItem';
import ExpenseForm from './ExpenseForm';
import Modal from '../../common/Modal';
import Button from '../../common/Button';
import Input from '../../common/Input';

/**
 * 支出項目の型定義
 */
interface Expense {
  id: string;
  date: string;
  category: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
}

/**
 * 予算データの型定義
 */
interface BudgetData {
  transportation: number;
  accommodation: number;
  food: number;
  activities: number;
}

/**
 * カテゴリ別予算の型定義
 */
interface CategoryBudget {
  category: string;
  amount: number;
  isEditing: boolean;
}

/**
 * 予算タブコンポーネントのプロパティ
 */
interface BudgetTabProps {
  budgetData?: BudgetData;
}

/**
 * 予算タブコンポーネント
 * 予算管理、支出の追加・編集・削除機能を提供
 */
const BudgetTab: React.FC<BudgetTabProps> = ({ budgetData }) => {
  // 支出データの状態
  const [expenses, setExpenses] = useState<Expense[]>([]);

  // カテゴリ別予算の状態
  const [categoryBudgets, setCategoryBudgets] = useState<CategoryBudget[]>([]);

  // カテゴリの状態
  const [categories, setCategories] = useState<string[]>([
    '交通費', '宿泊費', '食費', '観光費', 'ショッピング', 'その他'
  ]);

  // モーダルの状態
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [showEditExpenseModal, setShowEditExpenseModal] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [newCategory, setNewCategory] = useState('');

  // AI生成の予算データを初期支出として設定
  useEffect(() => {
    if (budgetData) {
      // AI推測予算をカテゴリ別予算に設定
      const aiCategoryBudgets: CategoryBudget[] = [
        { category: '交通費', amount: budgetData.transportation, isEditing: false },
        { category: '宿泊費', amount: budgetData.accommodation, isEditing: false },
        { category: '食費', amount: budgetData.food, isEditing: false },
        { category: '観光費', amount: budgetData.activities, isEditing: false }
      ];
      setCategoryBudgets(aiCategoryBudgets);
    } else {
      // AI生成データがない場合は空のリスト
      setExpenses([]);
      setCategoryBudgets([]);
    }
  }, [budgetData]);

  // 予算計算
  const totalBudget = categoryBudgets.reduce((sum, budget) => sum + budget.amount, 0);
  const totalExpenses = expenses.reduce((sum, expense) => 
    expense.type === 'expense' ? sum + expense.amount : sum - expense.amount, 0
  );
  const remainingBudget = totalBudget - totalExpenses;

  // カテゴリ別集計
  const categoryTotals = expenses.reduce((acc, expense) => {
    const amount = expense.type === 'expense' ? expense.amount : -expense.amount;
    acc[expense.category] = (acc[expense.category] || 0) + amount;
    return acc;
  }, {} as Record<string, number>);

  /**
   * カテゴリ予算の編集開始
   */
  const startEditBudget = (category: string) => {
    setCategoryBudgets(prev => prev.map(budget => 
      budget.category === category ? { ...budget, isEditing: true } : budget
    ));
  };

  /**
   * カテゴリ予算の保存
   */
  const saveBudget = (category: string, amount: number) => {
    setCategoryBudgets(prev => prev.map(budget => 
      budget.category === category ? { ...budget, amount, isEditing: false } : budget
    ));
  };

  /**
   * カテゴリ予算の編集キャンセル
   */
  const cancelEditBudget = (category: string) => {
    setCategoryBudgets(prev => prev.map(budget => 
      budget.category === category ? { ...budget, isEditing: false } : budget
    ));
  };

  /**
   * 支出追加
   */
  const handleAddExpense = () => {
    setShowAddExpenseModal(true);
  };

  /**
   * 支出編集
   */
  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setShowEditExpenseModal(true);
  };

  /**
   * 支出削除
   */
  const deleteExpense = (id: string) => {
    setExpenses(expenses.filter(expense => expense.id !== id));
  };

  /**
   * 新しい支出を保存
   */
  const saveNewExpense = (expense: Expense) => {
    setExpenses([...expenses, expense]);
    setShowAddExpenseModal(false);
  };

  /**
   * 編集した支出を保存
   */
  const saveEditedExpense = (expense: Expense) => {
    setExpenses(expenses.map(e => e.id === expense.id ? expense : e));
    setShowEditExpenseModal(false);
    setEditingExpense(null);
  };

  /**
   * カテゴリ追加
   */
  const addCategory = () => {
    if (newCategory.trim() && !categories.includes(newCategory.trim())) {
      setCategories([...categories, newCategory.trim()]);
      setNewCategory('');
      setShowAddCategoryModal(false);
    }
  };

  /**
   * カテゴリ削除
   */
  const deleteCategory = (category: string) => {
    if (category !== 'その他') {
      setCategories(categories.filter(cat => cat !== category));
      // このカテゴリの支出を「その他」に変更
      setExpenses(expenses.map(expense => 
        expense.category === category ? { ...expense, category: 'その他' } : expense
      ));
    }
  };

  return (
    <div className="space-y-6">
      {/* 予算概要 */}
      <BudgetOverview
        totalBudget={totalBudget}
        totalExpenses={totalExpenses}
        remainingBudget={remainingBudget}
        expenses={expenses}
        categoryBudgets={categoryBudgets}
      />

      {/* AI推測カテゴリ別予算 */}
      {budgetData && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 dark:bg-gray-800 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">AI推測カテゴリ別予算</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {categoryBudgets.map((budget) => (
              <div key={budget.category} className="border border-gray-200 rounded-lg p-4 dark:border-gray-700">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{budget.category}</p>
                  {budget.isEditing ? (
                    <div className="flex gap-1">
                      <button
                        onClick={() => saveBudget(budget.category, budget.amount)}
                        className="text-green-600 hover:text-green-800"
                        aria-label="保存"
                      >
                        <Save className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => cancelEditBudget(budget.category)}
                        className="text-red-600 hover:text-red-800"
                        aria-label="キャンセル"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => startEditBudget(budget.category)}
                      className="text-blue-600 hover:text-blue-800"
                      aria-label="編集"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  )}
                </div>
                {budget.isEditing ? (
                  <Input
                    type="number"
                    value={budget.amount}
                    onChange={(e) => {
                      const newAmount = parseInt(e.target.value) || 0;
                      setCategoryBudgets(prev => prev.map(b => 
                        b.category === budget.category ? { ...b, amount: newAmount } : b
                      ));
                    }}
                    className="w-full"
                    placeholder="予算を入力"
                  />
                ) : (
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    ¥{budget.amount.toLocaleString()}
                  </p>
                )}
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Button
              variant="primary"
              onClick={() => setShowAddCategoryModal(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              <span>カテゴリを追加</span>
            </Button>
          </div>
        </div>
      )}

      {/* カテゴリ別集計 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 dark:bg-gray-800 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">カテゴリ別集計</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map(category => {
            const total = categoryTotals[category] || 0;
            return (
              <div key={category} className="text-center p-4 bg-gray-50 rounded-lg dark:bg-gray-700">
                <p className="text-sm text-gray-600 mb-1 dark:text-gray-400">{category}</p>
                <p className={`font-semibold ${total >= 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                  ¥{Math.abs(total).toLocaleString()}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">支出履歴</h2>
        <div className="flex gap-2">
          {/* スマホ：丸アイコンボタン */}
          <button
            onClick={() => setShowAddCategoryModal(true)}
            className="flex items-center justify-center bg-gray-200 text-gray-700 rounded-full w-10 h-10 shadow-md hover:bg-gray-300 transition-colors md:hidden"
            aria-label="カテゴリ管理"
          >
            <Settings className="h-5 w-5" />
          </button>
          <button
            onClick={handleAddExpense}
            className="flex items-center justify-center bg-blue-600 text-white rounded-full w-10 h-10 shadow-md hover:bg-blue-700 transition-colors md:hidden"
            aria-label="支出を追加"
          >
            <Plus className="h-5 w-5" />
          </button>
          {/* PC：従来のボタン */}
          <Button
            variant="secondary"
            onClick={() => setShowAddCategoryModal(true)}
            className="hidden md:flex items-center"
          >
            <Settings className="h-4 w-4 mr-2 md:mr-2" />
            <span className="hidden md:inline">カテゴリ管理</span>
          </Button>
          <Button
            variant="primary"
            onClick={handleAddExpense}
            className="hidden md:flex items-center"
          >
            <Plus className="h-4 w-4 mr-2 md:mr-2" />
            <span className="hidden md:inline">支出を追加</span>
          </Button>
        </div>
      </div>

      {/* 支出リスト */}
      <div className="space-y-3">
        {expenses.length > 0 ? (
          expenses.map((expense) => (
            <ExpenseItem
              key={expense.id}
              expense={expense}
              onEdit={handleEditExpense}
              onDelete={deleteExpense}
            />
          ))
        ) : (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
            <p className="text-gray-500 text-lg dark:text-gray-400">支出がありません</p>
            <p className="text-sm text-gray-400 mt-1 dark:text-gray-500">「支出を追加」ボタンから支出を追加してください</p>
          </div>
        )}
      </div>

      {/* 支出追加モーダル */}
      <Modal
        isOpen={showAddExpenseModal}
        onClose={() => setShowAddExpenseModal(false)}
        title="新しい支出を追加"
        size="lg"
      >
        <ExpenseForm
          expense={null}
          categories={categories}
          onSave={saveNewExpense}
          onCancel={() => setShowAddExpenseModal(false)}
        />
      </Modal>

      {/* 支出編集モーダル */}
      <Modal
        isOpen={showEditExpenseModal}
        onClose={() => {
          setShowEditExpenseModal(false);
          setEditingExpense(null);
        }}
        title="支出を編集"
        size="lg"
      >
        <ExpenseForm
          expense={editingExpense}
          categories={categories}
          onSave={saveEditedExpense}
          onCancel={() => {
            setShowEditExpenseModal(false);
            setEditingExpense(null);
          }}
        />
      </Modal>

      {/* カテゴリ追加モーダル */}
      <Modal
        isOpen={showAddCategoryModal}
        onClose={() => {
          setShowAddCategoryModal(false);
          setNewCategory('');
        }}
        title="カテゴリ管理"
        size="md"
      >
        <div className="space-y-6">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">新しいカテゴリを追加</h4>
            <div className="flex gap-2">
              <Input
                value={newCategory}
                onChange={(value) => setNewCategory(value)}
                placeholder="カテゴリ名を入力"
                className="flex-1"
              />
              <Button
                variant="primary"
                onClick={addCategory}
                disabled={!newCategory.trim() || categories.includes(newCategory.trim())}
              >
                追加
              </Button>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3">既存のカテゴリ</h4>
            <div className="space-y-2">
              {categories.map(category => (
                <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span>{category}</span>
                  {category !== 'その他' && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => deleteCategory(category)}
                    >
                      削除
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default BudgetTab; 