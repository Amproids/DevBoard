import { useDragLayer } from 'react-dnd';
import Column from './Column';

const layerStyles = {
	position: 'fixed',
	pointerEvents: 'none',
	zIndex: 100,
	left: 0,
	top: 0,
	transform: 'rotate(5deg)',
};

function getItemStyles(currentOffset) {
	if (!currentOffset) {
		return { display: 'none' };
	}
	const { x, y } = currentOffset;
	return {
		transform: `translate(${x}px, ${y}px) scale(1.05)`,
	};
}

export default function ColumnDragLayer({ columns, boardId, onColumnUpdated, onColumnDeleted, onMoveColumn }) {
	const { itemType, isDragging, item, currentOffset } = useDragLayer((monitor) => ({
		itemType: monitor.getItemType(),
		isDragging: monitor.isDragging(),
		item: monitor.getItem(),
		currentOffset: monitor.getSourceClientOffset(),
	}));

	if (!isDragging || itemType !== 'COLUMN' || !item) {
		return null;
	}

	const column = columns[item.index];
	if (!column) return null;

	return (
		<div style={layerStyles}>
			<div style={getItemStyles(currentOffset)}>
				<Column
					column={column}
					boardId={boardId}
					index={item.index}
					onColumnUpdated={onColumnUpdated}
					onColumnDeleted={onColumnDeleted}
					onMoveColumn={onMoveColumn}
				/>
			</div>
		</div>
	);
}
