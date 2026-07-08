import { gql } from "graphql-request";

// ─── Queries ────────────────────────────────────────────────────────────────
// Full analysis fetch — only used when viewing a single analysis detail page.
// Fetches all fields needed across all tabs.

export const GET_ANALYSIS = gql`
  query GetAnalysis($id: ID!) {
    getAnalysis(id: $id) {
      id
      userId
      resumeId
      jobDescriptionId
      status
      createdAt
      updatedAt

      toolStatus {
        ats
        skillGap
        optimizer
        coverLetter
        interview
        roadmap
      }

      results {
        ats {
          score
          strengths
          weaknesses
          missingKeywords
          summary
        }

        skillGap {
          missingSkills
          recommendedSkills
          learningPriority {
            skill
            reason
          }
          summary
        }

        optimizer {
          overallSummary
          atsImpact {
            currentScore
            expectedScore
            reason
          }
          keywordSuggestions
          experienceSuggestions {
            company
            role
            suggestions
          }
          projectSuggestions {
            project
            suggestions
          }
          sectionSuggestions {
            section
            suggestion
          }
          optimizedContent
        }

        coverLetter {
          subject
          content
        }

        interview {
          hr {
            id
            question
            difficulty
            topics
            answer
          }
          resumeBased {
            id
            question
            topics
            answer
          }
          experienceBased {
            id
            question
            topics
            answer
          }
          projectBased {
            id
            question
            topics
            answer
          }
          technical {
            id
            question
            difficulty
            topics
            answer
          }
          coding {
            id
            question
            difficulty
            topics
            answer
          }
          behavioral {
            id
            question
            topics
            answer
          }
          followUps {
            parentQuestion
            followUps {
              id
              question
              difficulty
              topics
              answer
            }
          }
        }

        roadmap {
          overview
          milestones {
            title
            description
            steps {
              order
              title
              description
              priority
              estimatedHours
              resources {
                title
                type
                query
                reason
              }
              outcomes
            }
          }
          interviewChecklist
        }
      }
    }
  }
`;

// Lightweight analysis fetch — used for polling status during pipeline execution.
export const GET_ANALYSIS_STATUS = gql`
  query GetAnalysisStatus($id: ID!) {
    getAnalysis(id: $id) {
      id
      status
      toolStatus {
        ats
        skillGap
        optimizer
        coverLetter
        interview
        roadmap
      }
    }
  }
`;

// ─── Mutations ──────────────────────────────────────────────────────────────

export const CREATE_ANALYSIS = gql`
  mutation CreateAnalysis($resumeId: ID!, $jobDescriptionId: ID!) {
    createAnalysis(resumeId: $resumeId, jobDescriptionId: $jobDescriptionId) {
      id
      status
    }
  }
`;

export const START_ANALYSIS = gql`
  mutation StartAnalysis($analysisId: ID!) {
    startAnalysis(analysisId: $analysisId)
  }
`;

export const GENERATE_INTERVIEW_QUESTIONS = gql`
  mutation GenerateInterviewQuestions($analysisId: ID!) {
    generateInterviewQuestions(analysisId: $analysisId)
  }
`;

export const GENERATE_LEARNING_ROADMAP = gql`
  mutation GenerateLearningRoadmap($analysisId: ID!) {
    generateLearningRoadmap(analysisId: $analysisId)
  }
`;
