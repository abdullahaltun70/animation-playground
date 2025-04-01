// AlertNotification.tsx (Modified)
import React from 'react';

import { AlertDialog, Button, Flex } from '@radix-ui/themes';

interface AlertNotificationProps {
	showAlert: boolean;
	setShowAlert: (value: boolean) => void;
	alertTitle: string;
	alertMessage: string;
	onConfirm: () => void;
	confirmButtonText?: string;
	cancelButtonText?: string;
}

const AlertNotification: React.FC<AlertNotificationProps> = ({
	showAlert,
	setShowAlert,
	alertTitle,
	alertMessage,
	onConfirm,
	confirmButtonText = 'Confirm',
	cancelButtonText = 'Cancel',
}) => (
	<AlertDialog.Root open={showAlert} onOpenChange={setShowAlert}>
		<AlertDialog.Content style={{ maxWidth: 450 }}>
			{' '}
			<AlertDialog.Title>{alertTitle}</AlertDialog.Title>
			<AlertDialog.Description size="2">{alertMessage}</AlertDialog.Description>
			<Flex gap="3" mt="4" justify="end">
				{/* Cancel Button */}
				<AlertDialog.Cancel>
					<Button
						variant="soft"
						color="gray"
						onClick={() => setShowAlert(false)}
					>
						{cancelButtonText}
					</Button>
				</AlertDialog.Cancel>
				{/* Confirm Button */}
				<AlertDialog.Action>
					<Button
						variant="solid"
						color="red"
						onClick={() => {
							onConfirm();
						}}
					>
						{confirmButtonText}
					</Button>
				</AlertDialog.Action>
			</Flex>
		</AlertDialog.Content>
	</AlertDialog.Root>
);

export default AlertNotification;
