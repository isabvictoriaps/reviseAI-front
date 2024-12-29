document.addEventListener("DOMContentLoaded", () => {
  const formElement = document.getElementById("flashcardForm");
  const flashcardsContainer = document.getElementById("flashcardsContainer");
  const generateNewButton = document.getElementById("generateNewFlashcards");
  const loadingMessage = document.getElementById("loadingMessage");
  const generatorSection = document.querySelector(".generator");

  if (!formElement) {
    console.error("Formulário não encontrado!");
    return;
  }

  const resetForm = () => {
    formElement.reset();
    formElement.style.display = "block";
    if (generatorSection) generatorSection.style.display = "block";
    if (flashcardsContainer) flashcardsContainer.innerHTML = "";
    if (generateNewButton) generateNewButton.style.display = "none";
  };

  if (generateNewButton) {
    generateNewButton.addEventListener("click", resetForm);
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (loadingMessage) loadingMessage.style.display = "block";

    try {
      const formData = {
        tipoConteudo: document.querySelector('input[name="tipoConteudo"]:checked')?.value,
        conteudo: document.getElementById("conteudo")?.value,
        quantidadeFlashcard: parseInt(document.getElementById("quantidadeFlashcard")?.value, 10),
        nivelDificuldade: document.querySelector('input[name="nivelDificuldade"]:checked')?.value,
      };

      if (!formData.conteudo || isNaN(formData.quantidadeFlashcard) || formData.quantidadeFlashcard < 5 || formData.quantidadeFlashcard > 10) {
        alert("Por favor, preencha o campo de conteúdo corretamente e escolha entre 5 a 10 flashcards.");
        return;
      }

      const response = await fetch("http://127.0.0.1:5000/flashcards/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Falha ao gerar flashcards. Tente novamente mais tarde.");
      }

      const data = await response.json();

      if (!data || typeof data.flashcards !== "string") {
        throw new Error("Resposta da API inválida ou não contém flashcards.");
      }

      let flashcardsJSON = data.flashcards.trim();
      if (flashcardsJSON.startsWith("```json")) {
        flashcardsJSON = flashcardsJSON.replace(/^```json\n/, "").replace(/\n```$/, "");
      }

      let flashcardsData;
      try {
        flashcardsData = JSON.parse(flashcardsJSON);
      } catch (error) {
        throw new Error("Erro ao processar os dados do JSON. Verifique o formato.");
      }

      if (!flashcardsData || Object.keys(flashcardsData).length === 0) {
        throw new Error("Nenhum flashcard encontrado.");
      }

      if (flashcardsContainer) {
        flashcardsContainer.innerHTML = "";
        Object.entries(flashcardsData).forEach(([pergunta, resposta]) => {
          const card = document.createElement("div");
          card.className = "flashcard";
          card.innerHTML = `
            <div class="card-front">${pergunta}</div>
            <div class="card-back">${resposta}</div>
          `;
          flashcardsContainer.appendChild(card);
        });
      }

      formElement.style.display = "none";
      if (generateNewButton) generateNewButton.style.display = "block";
      if (generatorSection) generatorSection.style.display = "none";

    } catch (error) {
      console.error("Erro:", error.message);
      alert("Ocorreu um erro ao gerar os flashcards. Verifique a conexão com a API.");
    } finally {
      if (loadingMessage) loadingMessage.style.display = "none";
    }
  };

  formElement.addEventListener("submit", handleSubmit);
});
