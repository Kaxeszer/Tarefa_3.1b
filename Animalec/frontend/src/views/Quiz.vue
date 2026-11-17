<template>
  <section class="page-section">
    <b-container>
      <HeaderPage
        :title="quiz ? 'Quiz nº' + quiz.level + ' - ' + quiz.name : 'Quiz'"
      />
      <p v-if="loading" role="status">A carregar o quiz...</p>
      <p v-else-if="loadError" class="alert alert-danger" role="alert">
        {{ loadError }}
      </p>
      <router-link
        v-if="loadError"
        :to="{ name: 'quizzes' }"
        class="btn btn-outline-info"
        >VOLTAR</router-link
      >
      <b-row v-if="quiz">
        <b-col cols="1"></b-col>
        <b-col cols="10" align="right">{{seconds}}</b-col>
        <b-col cols="1"></b-col>
      </b-row>
      <b-row v-if="quiz">
        <b-col cols="1"></b-col>
        <b-col cols="10">
          <div>
            <b-card no-body>
              <b-tabs v-model="activeTab" pills card vertical>
                <b-tab
                  :disabled="currentQuestion !== index + 1"
                  v-for="(question, index) in quiz.questions"
                  :key="question.id"
                  :title="'QUESTÃO #' + (index + 1)"
                >
                  <b-card
                    :title="question.question"
                    :sub-title="'nível: ' + question.level + ' | tipo: ' + question.type"
                  >
                    <b-card-text v-html="question.description" />
                    <b-form-group label="Respostas possíveis">
                      <b-form-radio
                        v-for="answer in question.answers"
                        :key="answer.id"
                        v-model="option"
                        name="some-radios"
                        :value="answer._id"
                      >{{answer.title}}</b-form-radio>
                    </b-form-group>
                    <b-button variant="outline-success" @click="setAnswer()">RESPONDER</b-button>
                  </b-card>
                </b-tab>
                <b-tab title="RESULTADOS" :disabled="currentQuestion <= quiz.questions.length">
                  <b-card-text class="text-center">
                    <div>
                      <h5>Respostas certas</h5>
                      <b-progress
                        :value="correctAnswers"
                        :max="quiz.questions.length"
                        variant="success"
                        show-value
                        class="mb-3"
                      ></b-progress>
                      <h5>Respostas erradas</h5>
                      <b-progress
                        :value="quiz.questions.length - correctAnswers"
                        :max="quiz.questions.length"
                        variant="danger"
                        show-value
                        class="mb-3"
                      ></b-progress>
                    </div>

                    <div v-if="quiz.questions.length === correctAnswers">
                      <i class="fas fa-smile fa-3x"></i>
                      <br />
                      <h2>PARABÉNS, GANHASTE {{quiz.points}} PONTOS!</h2>
                      <br />
                      <router-link :to="{name: 'quizzes'}" tag="b-button" variant="outline-success" class="mr-2">
                        <i class="fas fa-poll-h"></i> JOGAR NOVO NÍVEL DO QUIZ
                      </router-link>
                      <router-link :to="{name: 'home'}" tag="b-button" variant="outline-success" class="mr-2">
                        <i class="fas fa-home"></i> PÁGINA PRINCIPAL
                      </router-link>
                      <b-button variant="outline-info" @click="showAnimals()"
                        >VER ANIMAIS</b-button
                      >
                    </div>
                    <div v-else>
                      <i class="fas fa-frown fa-3x"></i>
                      <br />
                      <h2>PACIÊNCIA, JOGA DE NOVO!</h2>
                      <br />
                      <b-button
                        variant="outline-success"
                        @click="restartQuiz()"
                        class="mr-2"
                      >JOGAR NOVAMENTE ESTE QUIZ</b-button>
                      <b-button variant="outline-info" @click="showAnimals()"
                        >VER ANIMAIS</b-button
                      >
                    </div>
                  </b-card-text>
                </b-tab>
              </b-tabs>
            </b-card>
          </div>
        </b-col>
        <b-col cols="1"></b-col>
      </b-row>
    </b-container>
  </section>
</template>

<script>
import HeaderPage from "@/components/HeaderPage.vue";
import { mapGetters } from "vuex";
import router from "@/router";
import { FETCH_QUIZZES } from "@/store/quizzes/quiz.constants";
import { EDIT_USER } from "@/store/users/user.constants";

export default {
  name: "Animal",
  components: {
    HeaderPage
  },
  data: function() {
    return {
      quiz: null,
      loading: true,
      loadError: "",
      activeTab: 0,
      timer: null,
      evaluated: false,
      option: "",
      currentQuestion: 1,
      answers: [],
      correctAnswers: 0,
      seconds: 30
    };
  },
  computed: {
    ...mapGetters("auth", ["getProfile"]),
    ...mapGetters("user", ["getUsersById"]),
    ...mapGetters("quiz", ["getQuizById"])
  },
  methods: {
    showAnimals() {
      router.push({ name: "animals" });
    },
    stopTimer() {
      if (this.timer !== null) clearInterval(this.timer);
      this.timer = null;
    },
    restartQuiz() {
      this.stopTimer();
      this.option = "";
      this.currentQuestion = 1;
      this.answers = [];
      this.correctAnswers = 0;
      this.seconds = 30;
      this.activeTab = 0;
      this.evaluated = false;
      this.timer = setInterval(() => {
        this.seconds -= 1;
        if (this.seconds <= 0) this.evaluate();
      }, 1000);
    },
    setAnswer() {
      if (this.evaluated) return;
      if (!this.option) {
        this.$alert("Seleciona uma resposta.", "Resposta", "info");
        return;
      }
      this.answers.push(this.option);
      this.option = "";
      this.currentQuestion += 1;
      this.activeTab = this.currentQuestion - 1;
      if (this.currentQuestion > this.quiz.questions.length) {
        this.evaluate();
      }
    },
    evaluate() {
      if (this.evaluated || !this.quiz) return;
      this.evaluated = true;
      this.stopTimer();
      this.correctAnswers = this.quiz.questions.reduce(
        (total, question, index) => {
          const correct = question.answers.find(answer => answer.correct);
          return (
            total + (correct && correct._id === this.answers[index] ? 1 : 0)
          );
        },
        0
      );
      this.currentQuestion = this.quiz.questions.length + 1;
      this.activeTab = this.quiz.questions.length;
      if (this.correctAnswers === this.quiz.questions.length)
        this.setScore(this.quiz.points);
    },
    setScore(points) {
      const user = this.getProfile 
      user.gamification.points += points
      user.gamification.quiz += 1
      
      this.$store.dispatch(`user/${EDIT_USER}`, user).then(
        () => {},
        err => {
          this.$alert(`${err.message}`, "Erro", "error");
        }
      );
    }
  },
  async created() {
    try {
      let record = this.getQuizById(this.$route.params.quizId);
      if (!record) {
        await this.$store.dispatch(`quiz/${FETCH_QUIZZES}`);
        record = this.getQuizById(this.$route.params.quizId);
      }
      if (!record) throw new Error("Quiz não encontrado.");
      if (
        !Array.isArray(record.questions) ||
        !record.questions.length ||
        record.questions.some(
          question =>
            !question ||
            !Array.isArray(question.answers) ||
            !question.answers.some(answer => answer.correct)
        )
      ) {
        throw new Error(
          "Este quiz não tem questões e respostas válidas para jogar."
        );
      }
      this.quiz = JSON.parse(JSON.stringify(record));
      this.restartQuiz();
    } catch (error) {
      this.quiz = null;
      this.loadError = error.message || "Não foi possível carregar o quiz.";
    } finally {
      this.loading = false;
    }
  },
  beforeDestroy() {
    this.stopTimer();
  }
};
</script>

<style>
img {
  max-width: 100%;
  max-height: 100%;
}
</style>
