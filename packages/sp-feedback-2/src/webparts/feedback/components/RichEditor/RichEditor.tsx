import * as React from 'react';
import Image from '@tiptap/extension-image';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { ChoiceGroup, DefaultButton, Dialog, DialogFooter, DialogType, Icon, PrimaryButton, TextField } from 'office-ui-fabric-react';
import styles from './RichEditor.module.scss';

export interface IRichEditorProps {
	id?: string;
	editable?: boolean;
	initialCotnent?: string;
	onChange: (html: string) => void;
}

export async function getBase64DataFromFile(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		try {
			const reader = new FileReader();
			reader.onload = function(e) {
				resolve(e.target.result as string);
			};
			reader.readAsDataURL(file);
		} catch (err) {
			reject(err);
		}
	});
}

const ImageDialog: React.FC<{ isOpen: boolean; onDismiss: () => void, onSubmit: (file: string) => void }> = (
	props
) => {
	type ImageType = 'attach' | 'url';
	const [type, setType] = React.useState<ImageType>('attach');
	const [file, setFile] = React.useState<File>(null);
	const [url, setUrl] = React.useState<string>('');

	let body;
	if (type === 'attach') {
		body = (
			<button className={styles['file-input-wrapper']}
				onClick={() => {
					const input = document.getElementById("file-input") as HTMLInputElement;
					input.click();
				}}
			>
				<span
					className={styles['file-input-label']}
				>
					<Icon iconName="Attach" /> Choose a file
				</span>
				{file && (
					<span className={styles['file-name']}>{file.name}</span>
				)}
				<input
					type="file"
					id="file-input"
					accept="image/*"
					onChange={(ev) => {
						const target = ev.target as HTMLInputElement;
						if (target.files.length === 0) return;
						setFile(target.files[0]);
					}}
				/>
			</button>
		);
	} else {
		body = <div>
			<TextField label='Image Url' value={url} onChange={(_e, value) => setUrl(value)} />
		</div>;
	}

	const onDismiss = (): void => {
		props.onDismiss();
			setFile(null);
			setUrl('');
	}

	const onSubmit = async (): Promise<void> => {
		let src;
		if (type === 'attach' && file) {
			src = getBase64DataFromFile(file);
			onDismiss();
			props.onSubmit(await src);
		}
		if (type === 'url' && url) {
			src = url;
			onDismiss();
			props.onSubmit(src);
		}
	}

	return (
		<Dialog
			isOpen={props.isOpen}
			onDismiss={onDismiss}
			title="Attach image"
			subText="You can attach an image from you local system, or provide an Url to an image."
			dialogContentProps={{
				type: DialogType.largeHeader,
			}}
			className={styles['image-dialog']}
		>
			<ChoiceGroup
				options={[
					{
						key: 'attach',
						text: 'Attach',
						iconProps: {
							iconName: 'Attach',
						},
					},
					{
						key: 'url',
						text: 'Url',
						iconProps: {
							iconName: 'Website',
						},
					},
				]}
				selectedKey={type}
				onChange={(_ev, opt) => {
					setType(opt.key as ImageType);
				}}
			/>
			<div className={styles.body}>{body}</div>
			<DialogFooter>
				<PrimaryButton onClick={onSubmit}>Submit</PrimaryButton>
				<DefaultButton onClick={onDismiss}>Cancel</DefaultButton>
			</DialogFooter>
		</Dialog>
	);
};

export const RichEditor: React.FC<IRichEditorProps> = ({
	editable = true,
	...props
}) => {
	const [imageDialogOpen, setImageDialogOpen] = React.useState<boolean>(false);

	const editor = useEditor({
		extensions: [
			StarterKit,
			Image.configure({
				allowBase64: true,
			}),
			Link.configure({
				openOnClick: true,
				linkOnPaste: true,
				HTMLAttributes: {
					rel: 'noreferrer,noopener',
					target: '_blank',
				},
			}),
		],
		onUpdate: (innerProps) => props.onChange(innerProps.editor.getHTML()),
		onBlur: (innerProps) => props.onChange(innerProps.editor.getHTML()),
		content: props.initialCotnent || '',
		editable: editable,
	});

	return (
		<div className={styles.container}>
			{editor && editable && (
				<div className={styles.toolbar}>
					<button
						title="Bold"
						type="button"
						tabIndex={-1}
						onClick={() =>
							editor.chain().focus().toggleBold().run()
						}
						disabled={
							!editor.can().chain().focus().toggleBold().run()
						}
						className={editor.isActive('bold') ? styles.active : ''}
					>
						<Icon iconName="Bold" />
					</button>
					<button
						title="Italic"
						type="button"
						tabIndex={-1}
						onClick={() =>
							editor.chain().focus().toggleItalic().run()
						}
						disabled={
							!editor.can().chain().focus().toggleItalic().run()
						}
						className={
							editor.isActive('italic') ? styles.active : ''
						}
					>
						<Icon iconName="Italic" />
					</button>
					<button
						title="Strikethrough"
						type="button"
						tabIndex={-1}
						onClick={() =>
							editor.chain().focus().toggleStrike().run()
						}
						disabled={
							!editor.can().chain().focus().toggleStrike().run()
						}
						className={
							editor.isActive('strike') ? styles.active : ''
						}
					>
						<Icon iconName="Strikethrough" />
					</button>
					<button
						title="Heading level 1"
						type="button"
						tabIndex={-1}
						onClick={() =>
							editor
								.chain()
								.focus()
								.toggleHeading({ level: 1 })
								.run()
						}
						disabled={
							!editor
								.can()
								.chain()
								.focus()
								.toggleHeading({ level: 1 })
								.run()
						}
						className={
							editor.isActive('heading', { level: 1 })
								? styles.active
								: ''
						}
					>
						<Icon iconName="Header1" />
					</button>
					<button
						title="Heading level 2"
						type="button"
						tabIndex={-1}
						onClick={() =>
							editor
								.chain()
								.focus()
								.toggleHeading({ level: 2 })
								.run()
						}
						disabled={
							!editor
								.can()
								.chain()
								.focus()
								.toggleHeading({ level: 2 })
								.run()
						}
						className={
							editor.isActive('heading', { level: 2 })
								? styles.active
								: ''
						}
					>
						<Icon iconName="Header2" />
					</button>
					<button
						title="Heading level 3"
						type="button"
						tabIndex={-1}
						onClick={() =>
							editor
								.chain()
								.focus()
								.toggleHeading({ level: 3 })
								.run()
						}
						disabled={
							!editor
								.can()
								.chain()
								.focus()
								.toggleHeading({ level: 3 })
								.run()
						}
						className={
							editor.isActive('heading', { level: 3 })
								? styles.active
								: ''
						}
					>
						<Icon iconName="Header3" />
					</button>
					<button
						title="Heading level 4"
						type="button"
						tabIndex={-1}
						onClick={() =>
							editor
								.chain()
								.focus()
								.toggleHeading({ level: 4 })
								.run()
						}
						disabled={
							!editor
								.can()
								.chain()
								.focus()
								.toggleHeading({ level: 4 })
								.run()
						}
						className={
							editor.isActive('heading', { level: 4 })
								? styles.active
								: ''
						}
					>
						<Icon iconName="Header4" />
					</button>
					<button
						title="Numbered list"
						type="button"
						tabIndex={-1}
						onClick={() =>
							editor.chain().focus().toggleOrderedList().run()
						}
						disabled={
							!editor
								.can()
								.chain()
								.focus()
								.toggleOrderedList()
								.run()
						}
						className={
							editor.isActive('orderedList') ? styles.active : ''
						}
					>
						<Icon iconName="NumberedList" />
					</button>
					<button
						title="Bullet list"
						type="button"
						tabIndex={-1}
						onClick={() =>
							editor.chain().focus().toggleBulletList().run()
						}
						disabled={
							!editor
								.can()
								.chain()
								.focus()
								.toggleBulletList()
								.run()
						}
						className={
							editor.isActive('bulletList') ? styles.active : ''
						}
					>
						<Icon iconName="BulletedList" />
					</button>
					<button
						title="Quote"
						type="button"
						tabIndex={-1}
						onClick={() =>
							editor.chain().focus().toggleBlockquote().run()
						}
						disabled={
							!editor
								.can()
								.chain()
								.focus()
								.toggleBlockquote()
								.run()
						}
						className={
							editor.isActive('blockquote') ? styles.active : ''
						}
					>
						<Icon iconName="RightDoubleQuote" />
					</button>
					<button
						title="Code block"
						type="button"
						tabIndex={-1}
						onClick={() =>
							editor.chain().focus().toggleCodeBlock().run()
						}
						disabled={
							!editor
								.can()
								.chain()
								.focus()
								.toggleCodeBlock()
								.run()
						}
						className={
							editor.isActive('codeBlock') ? styles.active : ''
						}
					>
						<Icon iconName="CodeEdit" />
					</button>
					<button
						title="Add image"
						type="button"
						tabIndex={-1}
						onClick={() => setImageDialogOpen(true)}
					>
						<Icon iconName="FileImage" />
					</button>
				</div>
			)}
			<EditorContent id={props.id} editor={editor} />
			<ImageDialog
				isOpen={imageDialogOpen}
				onDismiss={() => setImageDialogOpen(false)}
				onSubmit={(fileData) => editor.commands.setImage({
					src: fileData,
				})}
			/>
		</div>
	);
};
