import React, { useState } from 'react';

function AccountDeactivation({ onDeactivate }) {
    const [confirmation, setConfirmation] = useState('');

    const handleChange = event => {
        const { _, value } = event.target;
        setConfirmation(value);
    };

    return (
        <div className="text-base">
            <h2 className="text-xl font-medium mb-4 mt-4 md:mt-16">
                Account Deactivation
            </h2>
            <form>
                <div className="flex flex-col mb-4">
                    <input
                        type="text"
                        id="confirmation"
                        name="confirmation"
                        className="border border-gray-300 md:w-lg rounded-lg p-2 focus:outline-none focus:ring-0"
                        value={confirmation}
                        onChange={handleChange}
                        placeholder="Type 'DEACTIVATE' to remove your account"
                    />
                </div>
                <button
                    className="bg-warning cursor-pointer text-red-800 py-2 px-4 rounded-lg hover:bg-red-200 focus:outline-none focus:ring-0"
                    type="submit"
                >
                    Deactivate Account
                </button>
            </form>
        </div>
    );
}

export default AccountDeactivation;
