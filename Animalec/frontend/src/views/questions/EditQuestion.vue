<template>
  <section class="page-section">
    <b-container>
      <HeaderPage title="Editar Questão"/>

      <!--FORM-->
      <b-row>        
        <b-col cols="2"></b-col>
        <b-col cols="8">
          <p v-if="loading" role="status">A carregar o registo...</p>
          <p v-else-if="loadError" class="alert alert-danger" role="alert">
            {{ loadError }}
          </p>
          <router-link
            v-if="loadError"
            :to="{ name: 'listQuestions' }"
            class="btn btn-outline-info"
            >VOLTAR À LISTAGEM</router-link
          >
          <form v-if="question && !loading" @submit.prevent="update">
            <div class="form-group">
              <input
                v-model="question.question"
                type="text"
                class="form-control"
                id="txtName"
                placeholder="escreve a questão"
                required
              />
            </div>
            <div class="form-group">
              <textarea
                id="txtDescription"
                class="form-control"
                placeholder="escreve uma descrição"
                cols="30"
                rows="10"
                v-model="question.description"
                required
              ></textarea>
            </div>
            <div class="form-group">
              <input
                v-model="question.level"
                type="number"
                min="1"
                max="5"
                class="form-control"
                id="txtLevel"
                placeholder="indica o nível da questão"
                required
              />
            </div>
            <div v-if="question.answers.length">
              <div class="row">
                <div class="col-md-7">
                  <h4>Lista de respostas</h4>
                </div>
                <div class="col-md-2">
                  <h4>Correta</h4>
                </div>
                <div class="col-md-3">
                  <h4>Ações</h4>
                </div>
              </div>
            </div>
            <div v-for="(answer, index) in question.answers" :key="answer.id">
              <div class="form-group">
                <div class="row">
                  <div class="col-md-7">
                    <input
                      :key="index"
                      v-model.lazy="answer.title"
                      type="text"
                      class="form-control"
                      id="txtAnswer"
                      :placeholder="setPlaceHolder(index+1)"
                      required
                    />
                  </div>
                  <div class="col-md-2">
                    <input
                      :key="index"
                      v-model="answer.correct"
                      type="checkbox"
                      class="form-control"
                      id="chkAnswer"
                    />
                  </div>
                  <div class="col-md-3">
                    <button
                      @click="removeAnswer(index)"
                      type="button"
                      class="btn btn-outline-danger mr-2"
                    ><i class="fas fa-trash"></i> REMOVER</button>
                  </div>
                </div>
              </div>
            </div>
            <button
              @click="addAnswer"
              type="button"
              class="btn btn-outline-success mr-2"
            ><i class="fas fa-plus-square"></i> ADICIONAR RESPOSTAS</button>
            
            <button type="submit" class="btn btn-outline-success mr-2"><i class="fas fa-save"></i> ATUALIZAR</button>
            <router-link
              :to="{name: 'listQuestions'}"
              tag="button"
              class="btn btn-outline-danger"
            ><i class="fas fa-window-close"></i> CANCELAR</router-link>
          </form>
        </b-col>
        <b-col cols="2"></b-col>
      </b-row>
     </b-container>
  </section>
</template>

<script>
import {
  EDIT_QUESTION,
  FETCH_QUESTIONS
} from "@/store/questions/question.constants";
import router from "@/router";
import HeaderPage from "@/components/HeaderPage.vue"
import { mapGetters } from "vuex";

export default {
  name: "EditQuestion",  
  components: {
    HeaderPage
  },
  data: () => {
    return {
      question: null,
      loading: true,
      loadError: ""
    };
  },
  computed: {
    ...mapGetters("question", ["getQuestionById","getMessage"])
  },
  methods: {
    update() {
      if (
        !Array.isArray(this.question.answers) ||
        !this.question.answers.length ||
        this.question.answers.some(
          answer => !answer.title || !answer.title.trim()
        ) ||
        !this.question.answers.some(answer => answer.correct)
      ) {
        this.$alert(
          "Adiciona pelo menos uma resposta preenchida e assinala uma resposta correta.",
          "Erro de validação do formulário",
          "error"
        );
        return;
      }
      this.$store
        .dispatch(`question/${EDIT_QUESTION}`, this.$data.question)
        .then(
          () => {
            this.$alert(this.getMessage, "Questão atualizada!",  "success");
            router.push({name: 'listQuestions'});
          },
          err => {
            this.$alert(`${err.message}`, "Erro", "error");
          }
        );
    },
    setPlaceHolder: index => {
      return `insira a ${index}ª resposta`;
    },
    addAnswer() {
      this.question.answers.push({
        title: "",
        description: "",
        correct: false
      });
    },
    removeAnswer(index) {
      this.question.answers.splice(index, 1);
    }
  },
  async created() {
    try {
      let record = this.getQuestionById(this.$route.params.questionId);
      if (!record) {
        await this.$store.dispatch(`question/${FETCH_QUESTIONS}`);
        record = this.getQuestionById(this.$route.params.questionId);
      }
      if (!record) throw new Error("Questão: registo não encontrado.");
      this.question = JSON.parse(JSON.stringify(record));
      this.question.answers = Array.isArray(this.question.answers)
        ? this.question.answers
            .filter(Boolean)
            .map(answer =>
              Object.assign(
                { title: "", description: "", correct: false },
                answer
              )
            )
        : [];
    } catch (error) {
      this.question = null;
      this.loadError = error.message || "Não foi possível carregar o registo.";
    } finally {
      this.loading = false;
    }
  }
};
</script>
