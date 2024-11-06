import React from 'react';
import {
    AlertDialog,
    AlertDialogOverlay,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogBody,
    AlertDialogFooter,
    Button,
    useDisclosure
} from 'alert-dialog'; // Adjust based on your UI library

// AlertDialogComponent definition
const AlertDialogComponent = ({ isOpen, onClose, title, body, onConfirm }) => {
    return (
        <AlertDialog isOpen={isOpen} onClose={onClose}>
            <AlertDialogOverlay>
                <AlertDialogContent>
                    <AlertDialogHeader>{title}</AlertDialogHeader>
                    <AlertDialogBody>
                        {body}
                    </AlertDialogBody>
                    <AlertDialogFooter>
                        <Button onClick={onClose}>Cancel</Button>
                        <Button colorScheme="red" onClick={onConfirm} ml={3}>
                            Confirm
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialogOverlay>
        </AlertDialog>
    );
};

// Main App Component
const App = () => {
    const { isOpen, onOpen, onClose } = useDisclosure();

    const handleConfirm = () => {
        console.log("Confirmed!");
        onClose(); // Close the dialog after confirmation
    };

    return (
        <div>
            <Button onClick={onOpen}>Show Alert</Button>
            <AlertDialogComponent
                isOpen={isOpen}
                onClose={onClose}
                title="Delete Confirmation"
                body="Are you sure you want to delete this item? This action cannot be undone."
                onConfirm={handleConfirm}
            />
        </div>
    );
};

export default App;