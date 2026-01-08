document.addEventListener('DOMContentLoaded', function() {
    const markdownInput = document.getElementById('markdown-input');
    const previewOutput = document.getElementById('preview-output');

    // Configure marked options
    marked.setOptions({
        breaks: true,
        gfm: true
    });

    function updatePreview() {
        const markdownText = markdownInput.value;
        const htmlOutput = marked.parse(markdownText);
        previewOutput.innerHTML = htmlOutput;
    }

    // Initial render
    updatePreview();

    // Update preview on input
    markdownInput.addEventListener('input', updatePreview);

    // Also update on keyup for better responsiveness
    markdownInput.addEventListener('keyup', updatePreview);
});