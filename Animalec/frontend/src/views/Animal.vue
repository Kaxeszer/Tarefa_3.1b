<template>
  <section class="page-section">
    <b-container>
      <HeaderPage :title="animal ? animal.name : 'Animal'" />
      <p v-if="loading" role="status">A carregar o animal...</p>
      <p v-else-if="loadError" class="alert alert-danger" role="alert">
        {{ loadError }}
      </p>
      <router-link
        v-if="loadError"
        :to="{ name: 'animals' }"
        class="btn btn-outline-info"
        >VOLTAR</router-link
      >
      <b-row v-if="animal">
        <b-col>
          <b-card class="overflow-hidden" style="max-width: 1540px; ">
            <b-row>
              <b-col md="6" align="center">
                <b-card-img
                  v-if="
                    currentMedia &&
                      currentMedia.types !== 'video' &&
                      currentMedia.types !== 'sound'
                  "
                  :src="currentMedia.url"
                  class="rounded-0 mb-2"
                ></b-card-img>
                <iframe
                  v-else-if="currentMedia && currentMedia.types === 'video'"
                  :src="currentMedia.url"
                  title="Vídeo do animal"
                  class="w-100"
                  height="240"
                  allowfullscreen
                ></iframe>
                <audio
                  v-else-if="currentMedia && currentMedia.types === 'sound'"
                  :src="currentMedia.url"
                  controls
                  class="w-100"
                ></audio>
                <p v-else>Sem elementos multimédia disponíveis.</p>
                <br />
                <b-button
                  variant="danger"
                  class="mr-2"
                  @click="changeMedia(-1)"
                  :disabled="mediaLinks.length < 2"
                >
                  <i class="fas fa-arrow-alt-circle-left"></i> </b-button
                >&nbsp;{{ mediaLinks.length ? mediaIndex + 1 : 0 }} de
                {{ mediaLinks.length }}&nbsp;
                <b-button
                  variant="danger"
                  class="mr-2"
                  @click="changeMedia(1)"
                  :disabled="mediaLinks.length < 2"
                >
                  <i class="fas fa-arrow-alt-circle-right"></i>
                </b-button>
              </b-col>
              <b-col md="6">
                <b-card-body :title="animal.name + ' (' + animal.group + ')'">
                  <b-card-text align="left">
                    <!-- Level -->
                    <i class="fas fa-medal fa-lg ml-2"></i>
                    {{animal.level}}
                    <!-- Evaluation -->
                    <i class="fas fa-star fa-lg ml-2"></i>
                    {{animal.evaluation.length}}
                    <!-- Comments -->
                    <i class="fas fa-comment fa-lg ml-2" @click="showComments()"></i>
                    {{animal.comments.length}}
                    <!-- Ranking -->
                    <i class="fas fa-clipboard-list fa-lg ml-2"></i>
                    3
                  </b-card-text>
                  <b-card-text>
                    <b>Descrição:</b>
                    {{animal.description}}
                  </b-card-text>
                  <b-card-text>
                    <b>Comentários:</b>
                    <b-alert
                      show
                      variant="secondary"
                      v-for="comment in this.animal.comments"
                      :key="comment._id"
                    >
                      <b>{{comment.user.name}}</b>
                      ({{setCurrentDateTime(comment.date)}})
                      <br />
                      {{comment.body}}
                    </b-alert>
                  </b-card-text>
                  <b-card-text>
                    <b>Comentário:</b>
                    <div class="form-group">
                      <textarea
                        id="txtDescription"
                        class="form-control"
                        placeholder="escreve descrição"
                        cols="30"
                        rows="3"
                        v-model="comment"
                        required
                      ></textarea>
                      <br />
                      <b-button variant="danger" class="mr-2" @click="setComment()">
                        <i class="fas fa-comments"></i> COMENTAR
                      </b-button>
                      <b-button
                        variant="outline-success"
                        class="mr-2"
                        v-if="videoLink"
                        @click="showVideo(videoLink.url)"
                      >
                        <i class="fas fa-video"></i> VER VÍDEO
                      </b-button>

                      <router-link
                        :to="{name: 'animals'}"
                        tag="b-button"
                        variant="outline-danger"
                        align="center"
                        class="mr-2"
                      >
                        <i class="fas fa-arrow-alt-circle-left"></i> VOLTAR
                      </router-link>
                    </div>
                  </b-card-text>
                </b-card-body>
              </b-col>
            </b-row>
          </b-card>
        </b-col>
      </b-row>
    </b-container>
  </section>
</template>

<script>
import HeaderPage from "@/components/HeaderPage.vue";
import { EDIT_ANIMAL, FETCH_ANIMALS } from "@/store/animals/animal.constants";
import { mapGetters } from "vuex";
export default {
  name: "Animal",
  components: {
    HeaderPage
  },
  data: function() {
    return {
      animal: null,
      loading: true,
      loadError: "",
      mediaIndex: 0,
      comment: ""
    };
  },
  computed: {
    mediaLinks() {
      return this.animal
        ? this.animal.links.filter(link => link && link.url)
        : [];
    },
    currentMedia() {
      return this.mediaLinks[this.mediaIndex];
    },
    videoLink() {
      return this.mediaLinks.find(link => link.types === "video");
    },
    ...mapGetters("animal", ["getAnimalsById", "getMessage"]),
    ...mapGetters("auth", ["getProfile"]),
    ...mapGetters("user", ["getUsersById","getNameById"]),
    ...mapGetters(["getUserLevelByPoints"])
  },
  methods: {
    changeMedia(direction) {
      if (this.mediaLinks.length)
        this.mediaIndex =
          (this.mediaIndex + direction + this.mediaLinks.length) %
          this.mediaLinks.length;
    },
    showVideo(videoUrl) {
      this.$fire({
        title: "<strong>Vídeo</strong>",
        icon: "info",
        html: `
          <iframe width='460' height='315' 
            src='${videoUrl}' frameborder='0' 
            allow='accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture'
            allowfullscreen></iframe> 
          `,
        focusConfirm: false,
        confirmButtonText: '<i class="fa fa-thumbs-up"></i> OK'
      });
    },
    showComments() {
      this.$fire({
        title: "<strong>Comentários</strong>",
        icon: "info",
        html: this.generateComments(),
        focusConfirm: false,
        confirmButtonText: '<i class="fa fa-thumbs-up"></i> OK'
      });
    },
    generateComments() {
      let comments = "";
      for (let comment of this.animal.comments) {
        comments += `
        <b-alert show variant="secondary">
          
          
          <b>${comment.user.name}</b> (${comment.date})<br>
          ${comment.body}  
        </b-alert>
        <br><br>
          `;
      }
      return comments;
    },
    setComment() {
      if (!this.comment.trim()) {
        this.$alert(
          "Escreve um comentário antes de enviar.",
          "Comentários",
          "info"
        );
        return;
      }
      this.animal.comments.push({
        body: this.comment,
        user: this.getProfile._id,
        date: this.getCurrentDateTime()
      });
      this.$store.dispatch(`animal/${EDIT_ANIMAL}`, this.animal).then(
        () => {
          this.$alert(`Obrigado pelo comentário!`, "Comentários", "success");
        },
        err => {
          this.$alert(`${err.message}`, "Erro", "error");
        }
      );
    },
    getCurrentDateTime() {
      const today = new Date();
      const date =
        today.getFullYear() +
        "-" +
        (today.getMonth() + 1) +
        "-" +
        today.getDate();
      const time = today.getHours() + ":" + today.getMinutes();
      return `${date} ${time}`;
    },
    setCurrentDateTime(commentDate) {
      const date = new Date(commentDate);
      const formatDate =
        date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
      const formatTime = date.getHours() + ":" + date.getMinutes();
      return `${formatDate} ${formatTime}`;
    }
  },
  async created() {
    try {
      let record = this.getAnimalsById(this.$route.params.animalId);
      if (!record) {
        await this.$store.dispatch(`animal/${FETCH_ANIMALS}`);
        record = this.getAnimalsById(this.$route.params.animalId);
      }
      if (!record) throw new Error("Animal não encontrado.");
      this.animal = JSON.parse(JSON.stringify(record));
      this.animal.links = Array.isArray(this.animal.links)
        ? this.animal.links.filter(Boolean)
        : [];
      this.animal.comments = Array.isArray(this.animal.comments)
        ? this.animal.comments
        : [];
      this.animal.evaluation = Array.isArray(this.animal.evaluation)
        ? this.animal.evaluation
        : [];
    } catch (error) {
      this.animal = null;
      this.loadError = error.message || "Não foi possível carregar o animal.";
    } finally {
      this.loading = false;
    }
  }
};
</script>
