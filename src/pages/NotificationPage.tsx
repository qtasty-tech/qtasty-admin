import axios from 'axios';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';

interface NotificationTemplate {
  id: string;
  name: string;
  subject: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationPage = () => {
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [currentTemplate, setCurrentTemplate] = useState<Partial<NotificationTemplate>>({
    name: '',
    subject: '',
    content: ''
  });
  const [editMode, setEditMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const editor = useEditor({
    extensions: [StarterKit, Underline],
    content: currentTemplate.content,
    onUpdate: ({ editor }) => {
      setCurrentTemplate(prev => ({ ...prev, content: editor.getHTML() }));
    },
  });

  const fetchTemplates = async () => {
    try {
      const response = await axios.get('http://localhost:8084/api/notifications/templates');
      setTemplates(response.data);
    } catch (error) {
      toast.error('Failed to fetch templates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  useEffect(() => {
    if (editor && currentTemplate.content !== editor.getHTML()) {
      editor.commands.setContent(currentTemplate.content || '');
    }
  }, [currentTemplate.content, editor]);

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleTemplateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editMode) {
        await axios.put(`http://localhost:8084/api/notifications/templates/${currentTemplate.id}`, currentTemplate);
      } else {
        await axios.post('http://localhost:8084/api/notifications/templates', currentTemplate);
      }
      await fetchTemplates();
      setIsTemplateModalOpen(false);
      setCurrentTemplate({ name: '', subject: '', content: '' });
      toast.success(`Template ${editMode ? 'updated' : 'created'} successfully`);
    } catch (error) {
      toast.error(`Failed to ${editMode ? 'update' : 'create'} template`);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this template?')) return;
    try {
      await axios.delete(`http://localhost:8084/api/notifications/templates/${id}`);
      await fetchTemplates();
      toast.success('Template deleted successfully');
    } catch (error) {
      toast.error('Failed to delete template');
    }
  };

  const handleSendNotifications = async () => {
    if (!selectedTemplate) {
      toast.error('Please select a template');
      return;
    }
    try {
      await axios.post(`http://localhost:8086/api/notifications/send`, null, {
        params: { templateId: selectedTemplate }
      });
      toast.success('Notifications sent successfully');
      setIsSendModalOpen(false);
    } catch (error) {
      toast.error('Failed to send notifications');
    }
  };

  const MenuBar = () => {
    if (!editor) return null;

    return (
      <div className="flex flex-wrap gap-2 p-2 border-b border-gray-200">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded ${editor.isActive('bold') ? 'bg-indigo-100 text-indigo-600' : 'hover:bg-gray-100'}`}
        >
          Bold
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded ${editor.isActive('italic') ? 'bg-indigo-100 text-indigo-600' : 'hover:bg-gray-100'}`}
        >
          Italic
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={`p-2 rounded ${editor.isActive('underline') ? 'bg-indigo-100 text-indigo-600' : 'hover:bg-gray-100'}`}
        >
          Underline
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded ${editor.isActive('heading') ? 'bg-indigo-100 text-indigo-600' : 'hover:bg-gray-100'}`}
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded ${editor.isActive('bulletList') ? 'bg-indigo-100 text-indigo-600' : 'hover:bg-gray-100'}`}
        >
          List
        </button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between mb-6 items-center">
        <h1 className="text-3xl font-bold text-gray-800">Newsletter Management</h1>
        <div className="flex gap-4">
          <button
            onClick={() => {
              setEditMode(false);
              setCurrentTemplate({ name: '', subject: '', content: '' });
              setIsTemplateModalOpen(true);
            }}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Create Template
          </button>
          <button
            onClick={() => setIsSendModalOpen(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Notify Users
          </button>
        </div>
      </div>

      <div className="mb-4">
      <div className="relative w-64">
         <input
              type="text"
              placeholder="Search templates..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
             <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
        
   
  </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-400">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Name</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Subject</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Last Updated</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-400">
            {filteredTemplates.map(template => (
              <tr key={template.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">{template.name}</td>
                <td className="px-6 py-4">{template.subject}</td>
                <td className="px-6 py-4">{new Date(template.updatedAt).toLocaleDateString()}</td>
                <td className="px-6 py-4 flex gap-3">
                  <button
                    onClick={() => {
                      setEditMode(true);
                      setCurrentTemplate(template);
                      setIsTemplateModalOpen(true);
                    }}
                    className="px-4 py-2 bg-indigo-400 text-indigo-800 rounded-lg hover:bg-indigo-300 transition-colors disabled:opacity-50"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteTemplate(template.id)}
                    className="text-red-600 hover:text-red-900 transition-colors"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isTemplateModalOpen && (
        <div className="fixed inset-0 bg-gray-800/80 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-4xl">
            <h2 className="text-xl font-bold mb-4">
              {editMode ? 'Edit Template' : 'Create New Template'}
            </h2>
            <form onSubmit={handleTemplateSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Template Name</label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={currentTemplate.name}
                    onChange={(e) => setCurrentTemplate(prev => ({...prev, name: e.target.value}))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={currentTemplate.subject}
                    onChange={(e) => setCurrentTemplate(prev => ({...prev, subject: e.target.value}))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                  <div className="border rounded-lg overflow-hidden">
                    <MenuBar />
                    <EditorContent
                      editor={editor}
                      className="min-h-[300px] p-4 focus:outline-none prose max-w-none"
                    />
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsTemplateModalOpen(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  {editMode ? 'Update Template' : 'Create Template'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isSendModalOpen && (
        <div className="fixed inset-0 bg-gray-800/80 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Send Notifications</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Template</label>
                <select
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select a template</option>
                  {templates.map(template => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsSendModalOpen(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSendNotifications}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Send Notifications
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationPage;