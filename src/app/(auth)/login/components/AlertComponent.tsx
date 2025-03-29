import React from 'react';

import { AlertDialog, Button, Flex } from '@radix-ui/themes';

interface AlertNotificationProps {
	showAlert: boolean;
	setShowAlert: (value: boolean) => void;
	alertTitle: string;
	alertMessage: string;
}

const AlertNotification: React.FC<AlertNotificationProps> = ({
	showAlert,
	setShowAlert,
	alertTitle,
	alertMessage,
}) => (
	<AlertDialog.Root open={showAlert} onOpenChange={setShowAlert}>
		<AlertDialog.Content maxWidth="450px">
			<AlertDialog.Title>{alertTitle}</AlertDialog.Title>
			<AlertDialog.Description size="2">{alertMessage}</AlertDialog.Description>
			<Flex gap="3" mt="4" justify="end">
				<AlertDialog.Action>
					<Button
						variant="solid"
						color="indigo"
						onClick={() => setShowAlert(false)}
					>
						OK
					</Button>
				</AlertDialog.Action>
			</Flex>
		</AlertDialog.Content>
	</AlertDialog.Root>
);

export default AlertNotification;
