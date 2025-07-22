 window.addEventListener('DOMContentLoaded', () => {
	const draftId = draftIdInput.value;

	// If hidden draftId is empty, search for any saved draft
	if (!draftId) {
		// Optionally, you can scan all keys for the logged-in user
		for (let i = 0; i < localStorage.length; i++) {
			const key = localStorage.key(i);
			if (key.startsWith('draft-')) {
                const res = prompt('You have a Saved draft from Previous Session do you want to continue it? type "yes" or "no"')
                if(!res || res.toLocaleLowerCase() === 'no'){
                    break;
                }
				const savedDraft = JSON.parse(localStorage.getItem(key));

				// Fill form fields
				titleInput.value = savedDraft.title || '';
				categoryInput.value = savedDraft.category || '';
				draftIdInput.value = savedDraft._id;
				if (savedDraft.content) {
					// Defer setData until editor is ready
					setTimeout(() => {
						if (window.ckeditor) {
							ckeditor.setData(savedDraft.content);
						}
					}, 500);
				}
				console.log('Draft restored from localStorage.');
				break; // Restore only one draft for now
			}
		}
	}
});