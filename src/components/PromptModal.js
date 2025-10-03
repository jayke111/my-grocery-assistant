import React, { useState, useEffect } from 'react';
import { useAppContext } from '../AppContext';

// This is a reusable modal for getting text input or confirmation from the user.
export const PromptModal = () => {
    const { promptConfig, setPromptConfig } = useAppContext();
    const [inputValue, setInputValue] = useState('');

    useEffect(() => {
        if (promptConfig.isOpen) {
            setInputValue(promptConfig.initialValue || '');
        }
    }, [promptConfig.isOpen, promptConfig.initialValue]);

    const handleClose = () => {
        if(promptConfig.onClose) promptConfig.onClose();
        setPromptConfig({ isOpen: false });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (promptConfig.type === 'input' && !inputValue.trim()) {
            return; // Or show an error
        }
        promptConfig.onSubmit(inputValue);
        handleClose();
    };
    
    const handleConfirm = () => {
        promptConfig.onSubmit();
        handleClose();
    };

    if (!promptConfig.isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm">
                <h3 className="text-lg font-bold mb-4">{promptConfig.title}</h3>
                <p className="text-sm text-gray-600 mb-4 whitespace-pre-wrap">{promptConfig.message}</p>
                
                {promptConfig.type === 'input' && (
                    <form onSubmit={handleSubmit}>
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md"
                            autoFocus
                        />
                        <div className="mt-6 flex justify-end gap-x-3">
                            <button type="button" onClick={handleClose} className="bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 transition">
                                Cancel
                            </button>
                            <button type="submit" className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition">
                                {promptConfig.confirmText || 'Save'}
                            </button>
                        </div>
                    </form>
                )}

                {promptConfig.type === 'confirm' && (
                     <div className="mt-6 flex justify-end gap-x-3">
                        <button type="button" onClick={handleClose} className="bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 transition">
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleConfirm}
                            className="bg-red-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-700 transition"
                        >
                            {promptConfig.confirmText || 'Confirm'}
                        </button>
                    </div>
                )}

                {promptConfig.type === 'alert' && (
                    <div className="mt-6 flex justify-end">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition"
                        >
                            {promptConfig.confirmText || 'OK'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
