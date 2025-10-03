import React, { useState } from 'react';
import { useAppContext } from '../AppContext';
import { LoadingSpinner, EmptyState, ProNav } from './UIComponents';
import { ShareListModal } from './ShareListModal';

export const UserDashboard = () => {
    const { userLists, dataLoading, setActiveListId, handleCreateNewList, handleDeleteList } = useAppContext();
    const [sharingList, setSharingList] = useState(null); 

    if (dataLoading) {
        return <LoadingSpinner />;
    }

    return (
        <div>
            <ProNav />

            <div className="bg-white p-6 rounded-b-2xl shadow-lg space-y-4">
                <button
                    onClick={handleCreateNewList}
                    className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 transition shadow-lg"
                >
                    + Create New List
                </button>

                {userLists && userLists.length === 0 ? (
                    <EmptyState message="No lists yet!" subMessage="Click the button above to create your first shopping list." />
                ) : (
                    <div className="space-y-3">
                        {userLists && userLists.map(list => (
                            <div key={list.id} className="bg-gray-50 p-4 rounded-xl shadow-sm border flex justify-between items-center">
                                <div>
                                    <button onClick={() => setActiveListId(list.id)} className="text-lg font-semibold text-gray-800 hover:text-blue-600 text-left">
                                        {list.name}
                                    </button>
                                    <p className="text-sm text-gray-500">
                                        Created: {new Date(list.createdAt?.toDate()).toLocaleDateString()} &middot; Items: {Object.values(list.items || {}).flat().length}
                                    </p>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <button onClick={() => setSharingList({ id: list.id, name: list.name })} className="text-gray-500 hover:text-blue-600" title="Share List">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                                    </button>
                                    <button onClick={() => handleDeleteList(list.id)} className="text-gray-500 hover:text-red-600" title="Delete List">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                
                {sharingList && (
                    <ShareListModal 
                        listId={sharingList.id} 
                        listName={sharingList.name} 
                        onClose={() => setSharingList(null)} 
                    />
                )}
            </div>
        </div>
    );
};
