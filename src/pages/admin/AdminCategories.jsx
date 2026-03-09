import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { categoriesApi } from '../../api/endpoints';

export default function AdminCategories() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentCategory, setCurrentCategory] = useState({ name: '', description: '' });
    const [isEditing, setIsEditing] = useState(false);
    const [formLoading, setFormLoading] = useState(false);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const response = await categoriesApi.getAll();
            if (response.data.success) {
                setCategories(response.data.categories);
            } else {
                setError('Failed to fetch categories');
            }
        } catch (err) {
            console.error('Error fetching categories:', err);
            setError('Failed to load categories. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleOpenModal = (category = { name: '', description: '' }) => {
        setCurrentCategory(category);
        setIsEditing(!!category._id);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentCategory({ name: '', description: '' });
        setIsEditing(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        try {
            if (isEditing) {
                await categoriesApi.update(currentCategory._id, currentCategory);
            } else {
                await categoriesApi.create(currentCategory);
            }
            fetchCategories();
            handleCloseModal();
        } catch (err) {
            console.error('Error saving category:', err);
            alert('Failed to save category');
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this category?')) return;
        try {
            await categoriesApi.delete(id);
            fetchCategories();
        } catch (err) {
            console.error('Error deleting category:', err);
            alert('Failed to delete category');
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <Link to="/admin/dashboard" className="text-sm font-bold text-primary-600 hover:text-primary-700 mb-2 inline-block uppercase tracking-wider">
                        ← Back to dashboard
                    </Link>
                    <h1 className="page-heading text-slate-900">Manage categories</h1>
                    <p className="mt-1 text-slate-600">Create and organize event categories</p>
                </div>

                <Button onClick={() => handleOpenModal()} size="md">Add Category</Button>
            </div>

            <Card padding={false} className="overflow-hidden shadow-soft">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50/80">
                                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Description</th>
                                <th className="text-right px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="3" className="px-6 py-10 text-center text-slate-500">
                                        <div className="flex justify-center mb-2">
                                            <div className="w-5 h-5 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
                                        </div>
                                        Loading categories...
                                    </td>
                                </tr>
                            ) : error ? (
                                <tr>
                                    <td colSpan="3" className="px-6 py-10 text-center text-red-500">
                                        {error}
                                        <Button onClick={() => fetchCategories()} className="mt-4 block mx-auto" size="sm" variant="secondary">Retry</Button>
                                    </td>
                                </tr>
                            ) : categories.length === 0 ? (
                                <tr>
                                    <td colSpan="3" className="px-6 py-10 text-center text-slate-500">
                                        No categories found.
                                    </td>
                                </tr>
                            ) : (
                                categories.map((category) => (
                                    <tr key={category._id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="font-semibold text-slate-900">{category.name}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm text-slate-600">{category.description || 'No description'}</p>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-3">
                                                <button
                                                    onClick={() => handleOpenModal(category)}
                                                    className="text-xs font-bold text-primary-600 hover:text-primary-700 uppercase tracking-tight"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(category._id)}
                                                    className="text-xs font-bold text-red-600 hover:text-red-700 uppercase tracking-tight"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <Card className="w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
                        <h2 className="text-xl font-bold text-slate-900 mb-6">
                            {isEditing ? 'Edit Category' : 'New Category'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Name</label>
                                <input
                                    type="text"
                                    required
                                    value={currentCategory.name}
                                    onChange={(e) => setCurrentCategory({ ...currentCategory, name: e.target.value })}
                                    className="w-full rounded-xl border-2 border-slate-300 text-sm focus:border-primary-500 focus:ring-primary-500 bg-white"
                                    placeholder="e.g., Workshop"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">Description</label>
                                <textarea
                                    value={currentCategory.description}
                                    onChange={(e) => setCurrentCategory({ ...currentCategory, description: e.target.value })}
                                    className="w-full rounded-xl border-2 border-slate-300 text-sm focus:border-primary-500 focus:ring-primary-500 h-24 bg-white"
                                    placeholder="Tell us about this category..."
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <Button
                                    type="button"
                                    onClick={handleCloseModal}
                                    variant="secondary"
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    loading={formLoading}
                                    className="flex-1"
                                >
                                    {isEditing ? 'Save Changes' : 'Create Category'}
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}
        </div>
    );
}
