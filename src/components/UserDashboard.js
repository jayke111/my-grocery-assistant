import { useAppContext } from '../AppContext';
import { EmptyState } from './UIComponents';

export const UserDashboard = () => {
    const { setPage, userLists, user, setActiveListId, handleCreateNewList, handleShareList, handleDeleteList } = useAppContext();
    const getItemCount = (list) => {
        if (!list || !list.items) return 0;
        return Object.values(list.items).flat().length;
    };
    return (
        <div className="bg-white p-6 rounded-2xl shadow-lg">
            <div className="flex border-b mb-6">
                <button className="flex-1 py-2 text-center font-semibold border-b-2 border-blue-600 text-blue-600">My Lists</button>
                <button onClick={() => setPage('meals')} className="flex-1 py-2 text-center font-semibold text-gray-500 hover:text-blue-600">My Meals</button>
                <button onClick={() => setPage('meal-plan')} className="flex-1 py-2 text-center font-semibold text-gray-500 hover:text-blue-600">Meal Plan</button>
            </div>
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">My Lists</h2>
            <button onClick={handleCreateNewList} className="w-full bg-green-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-600 transition mb-6">+ Create New List</button>
            {userLists && userLists.length > 0 ? (
                <ul className="space-y-3">
                    {userLists.map(list => (
                        <li key={list.id} onClick={() => setActiveListId(list.id)} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg border cursor-pointer hover:bg-blue-50 transition">
                            <div className="text-left flex-grow min-w-0">
                                <p className="font-semibold truncate">{list.name}</p>
                                <p className="text-sm text-gray-500">
                                    Created: {list.createdAt?.toDate().toLocaleDateString()}
                                </p>
                                <p className="text-sm text-gray-500">
                                    Items: {getItemCount(list)}
                                </p>
                            </div>
                            <div className="flex items-center flex-shrink-0 ml-4">
                                {/* --- MODIFIED: Added e.stopPropagation() to prevent the main click --- */}
                                {list.ownerId === user.uid && <button onClick={(e) => { e.stopPropagation(); handleShareList(list.id); }} className="text-blue-500 hover:text-blue-700 p-2 rounded-full" title="Share List"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4m0 0l-4 4m4-4v12" /></svg></button>}
                                {list.ownerId === user.uid && <button onClick={(e) => { e.stopPropagation(); handleDeleteList(list.id); }} className="text-red-500 hover:text-red-700 p-2 rounded-full" title="Delete List"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>}
                            </div>
                        </li>
                    ))}
                </ul>
            ) : ( <EmptyState message="No lists yet" subMessage="Click 'Create New List' to get started." /> )}
        </div>
    );
};
